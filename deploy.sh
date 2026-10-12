#!/usr/bin/env bash
# ==============================================================================
# Script de Deploy Automatizado para VPS — Connect Platz CRM & Portal
# Compatível com Ubuntu 20.04 / 22.04 / 24.04 e Debian 11 / 12
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}   🚀 CONNECT PLATZ CRM — DEPLOY AUTOMATIZADO NA VPS               ${NC}"
echo -e "${BLUE}===================================================================${NC}"

# 1. Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker não encontrado. Instalando Docker e Docker Compose...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 2. Configurar arquivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}Criando arquivo .env a partir de .env.production.example...${NC}"
    cp .env.production.example .env
    
    # Gerar JWT Secret seguro automaticamente se estiver usando padrão
    RANDOM_JWT=$(openssl rand -base64 32 | tr -d '\n')
    sed -i "s|gere_uma_chave_aleatoria_longa_com_openssl_rand_base64_32|${RANDOM_JWT}|g" .env
    
    echo -e "${GREEN}✓ Arquivo .env gerado com JWT_SECRET criptograficamente seguro!${NC}"
fi

# 3. Construir e iniciar os containers Docker
echo -e "${BLUE}Subindo os containers com Docker Compose...${NC}"
docker compose up -d --build

# 4. Aguardar o banco de dados ficar saudável
echo -e "${YELLOW}Aguardando inicialização do banco de dados PostgreSQL...${NC}"
until [ "$(docker inspect -f {{.State.Health.Status}} connect_platz_db 2>/dev/null)" = "healthy" ]; do
    printf '.'
    sleep 2
done
echo -e "\n${GREEN}✓ PostgreSQL pronto e respondendo!${NC}"

# 5. Sincronizar schema Prisma
echo -e "${BLUE}Sincronizando tabelas com Prisma (db push)...${NC}"
docker compose exec app npx prisma db push --accept-data-loss

# 6. Popular dados iniciais (Seed)
echo -e "${BLUE}Executando Seed de dados iniciais (Organização, Usuário Admin, Funis)...${NC}"
docker compose exec app npx prisma db seed || true

echo -e "${GREEN}===================================================================${NC}"
echo -e "${GREEN}   ✅ DEPLOY CONCLUÍDO COM SUCESSO!                                ${NC}"
echo -e "${GREEN}===================================================================${NC}"
echo -e "Acesse a aplicação no navegador em:"
echo -e "👉 ${BLUE}http://$(curl -s ifconfig.me 2>/dev/null || echo "SEU-IP-DA-VPS"):3000${NC}"
echo -e "👉 Login Admin: ${YELLOW}robson@connectplatz.com.br${NC}"
echo -e "👉 Senha Padrão: ${YELLOW}ConnectPlatz2026@${NC}"
echo -e "-------------------------------------------------------------------"
echo -e "Para configurar domínio com SSL e Nginx, siga o guia nginx/connect-platz.conf"
