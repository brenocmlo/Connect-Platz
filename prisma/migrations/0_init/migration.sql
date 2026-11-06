-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRADOR', 'ADMINISTRADOR_VENDA', 'ADMINISTRADOR_ALUGUEL', 'FINANCEIRO_VENDA', 'FINANCEIRO_ALUGUEL', 'CORRETOR_VENDA', 'CORRETOR_ALUGUEL');

-- CreateEnum
CREATE TYPE "BusinessModality" AS ENUM ('VENDA', 'ALUGUEL');

-- CreateEnum
CREATE TYPE "RentalContractStatus" AS ENUM ('ATIVO', 'PENDENTE_APROVACAO', 'FINALIZADO', 'CANCELADO', 'INADIMPLENTE');

-- CreateEnum
CREATE TYPE "CorretorStatus" AS ENUM ('DISPONIVEL', 'EM_VISITA', 'PAUSA', 'OFFLINE');

-- CreateEnum
CREATE TYPE "LeadTemperature" AS ENUM ('FRIO', 'MORNO', 'QUENTE');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('META_ADS', 'GOOGLE_ADS', 'MANUAL_CORRETOR', 'CATALOGO_SITE', 'INDICACAO', 'PORTAL_IMOBILIARIO', 'API_EXTERNA');

-- CreateEnum
CREATE TYPE "CreditEmploymentType" AS ENUM ('CLT', 'AUTONOMO', 'EMPRESARIO', 'APOSENTADO_PENSIONISTA', 'OUTRO');

-- CreateEnum
CREATE TYPE "CreditAnalysisStatus" AS ENUM ('NAO_INICIADA', 'EM_ANALISE', 'DOCUMENTACAO_PENDENTE', 'APROVADO', 'REPROVADO', 'CONDICIONADO');

-- CreateEnum
CREATE TYPE "PropertyModality" AS ENUM ('VENDA', 'VERANEIO_TEMPORADA', 'LOCACAO_ANUAL', 'AMBOS');

-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('ECONOMICO', 'MEDIO', 'ALTO_PADRAO', 'LUXO_FRENTE_MAR');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('DISPONIVEL', 'RESERVADA', 'VENDIDA', 'BLOQUEADA');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'TED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDENTE', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "CommissionBeneficiaryType" AS ENUM ('IMOBILIARIA', 'SOCIO_GESTOR', 'CORRETOR_TITULAR', 'CO_CORRETOR', 'CAPTACAO', 'PARCEIRO_EXTERNO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "CashFlowType" AS ENUM ('RECEITA', 'DESPESA');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('VISITA', 'LEMBRETE', 'DOCUMENTACAO', 'RETORNO_FOLLOWUP', 'REUNIAO', 'LIGACAO', 'APRESENTACAO_PROPOSTA', 'ASSINATURA_CONTRATO', 'ENTREGA_CHAVES', 'PLANTAO_VENDAS');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('AGENDADO', 'CONCLUIDO', 'CANCELADO', 'NAO_COMPARECEU');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cnpj" TEXT,
    "creci" TEXT,
    "logoUrl" TEXT,
    "logoDarkUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1266C7',
    "secondaryColor" TEXT NOT NULL DEFAULT '#D9BB4C',
    "bolsaoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bolsaoTimeoutMin" INTEGER NOT NULL DEFAULT 20,
    "operatingStart" TEXT NOT NULL DEFAULT '09:00',
    "operatingEnd" TEXT NOT NULL DEFAULT '22:00',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "telefone" TEXT,
    "creci" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CORRETOR_VENDA',
    "status" "CorretorStatus" NOT NULL DEFAULT 'OFFLINE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLeadAssignedAt" TIMESTAMP(3),
    "dailyCheckInAt" TIMESTAMP(3),
    "emergencyResetToken" TEXT,
    "emergencyResetExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userIp" TEXT,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnels" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "modalidade" "BusinessModality" NOT NULL DEFAULT 'VENDA',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funnels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_stages" (
    "id" UUID NOT NULL,
    "funnelId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "posicao" INTEGER NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#64748B',
    "slaMinutes" INTEGER,
    "actionOnExpire" TEXT NOT NULL DEFAULT 'transbordo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funnel_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "funnelId" UUID NOT NULL,
    "stageId" UUID NOT NULL,
    "corretorId" UUID,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "dataNascimento" DATE,
    "estadoCivil" TEXT,
    "regimeCasamento" TEXT,
    "profissao" TEXT,
    "bairrosInteresse" TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "observacoes" TEXT,
    "score" INTEGER,
    "rendaDeclarada" DECIMAL(12,2),
    "rendaInformal" DECIMAL(12,2),
    "faixaRenda" TEXT,
    "tipoOcupacaoCredito" "CreditEmploymentType",
    "rendaEspecificaAutonomo" DECIMAL(12,2),
    "statusCredito" "CreditAnalysisStatus" NOT NULL DEFAULT 'NAO_INICIADA',
    "modalidade" "BusinessModality" NOT NULL DEFAULT 'VENDA',
    "financialApprovalStatus" TEXT,
    "temperatura" "LeadTemperature" NOT NULL DEFAULT 'FRIO',
    "source" "LeadSource" NOT NULL DEFAULT 'META_ADS',
    "adId" TEXT,
    "formId" TEXT,
    "campaignName" TEXT,
    "adName" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "fbp" TEXT,
    "fbc" TEXT,
    "eventId" TEXT,
    "firstContactAt" TIMESTAMP(3),
    "slaDueAt" TIMESTAMP(3),
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "isBolsao" BOOLEAN NOT NULL DEFAULT false,
    "bolsaoEnteredAt" TIMESTAMP(3),
    "isNightQueue" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_timeline" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "userId" UUID,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT,
    "audioUrl" TEXT,
    "duracaoSegundos" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_documents" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tipoCadastro" TEXT NOT NULL DEFAULT 'EMPREENDIMENTO',
    "exibirNaLandingPage" BOOLEAN NOT NULL DEFAULT true,
    "modalidade" "PropertyModality" NOT NULL DEFAULT 'VENDA',
    "faixaPreco" "PriceRange" NOT NULL DEFAULT 'MEDIO',
    "estagioObra" TEXT,
    "valorVenda" DECIMAL(14,2),
    "valorDiaria" DECIMAL(12,2),
    "taxaLimpeza" DECIMAL(10,2),
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "zona" TEXT,
    "construtora" TEXT,
    "cep" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "descricao" TEXT,
    "fotos" TEXT[],
    "caracteristicas" JSONB,
    "diferenciais" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_units" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "bloco" TEXT NOT NULL,
    "pavimento" TEXT,
    "numeroUnidade" TEXT NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "valor" DECIMAL(14,2) NOT NULL,
    "areaPrivativa" DECIMAL(8,2),
    "reservadoAte" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_bookings" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "corretorId" UUID,
    "checkInDate" DATE NOT NULL,
    "checkOutDate" DATE NOT NULL,
    "totalNights" INTEGER NOT NULL,
    "valorDiarias" DECIMAL(12,2) NOT NULL,
    "taxaLimpeza" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "meioPagamento" "PaymentMethod" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMADA',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_contracts" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "codigoContrato" TEXT NOT NULL,
    "propertyId" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "corretorId" UUID NOT NULL,
    "valorAluguelMensal" DECIMAL(12,2) NOT NULL,
    "taxaAdministracaoPerc" DECIMAL(5,2) NOT NULL DEFAULT 10.0,
    "taxaIntermediacao" DECIMAL(12,2),
    "diaVencimento" INTEGER NOT NULL DEFAULT 10,
    "duracaoMeses" INTEGER NOT NULL DEFAULT 12,
    "dataInicio" DATE NOT NULL,
    "dataFim" DATE NOT NULL,
    "tipoGarantia" TEXT NOT NULL DEFAULT 'CAUCAO',
    "valorGarantia" DECIMAL(12,2),
    "status" "RentalContractStatus" NOT NULL DEFAULT 'ATIVO',
    "contratoPdfUrl" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "codigoVenda" TEXT NOT NULL,
    "leadId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "unitId" UUID,
    "corretorId" UUID NOT NULL,
    "valorVendaVGV" DECIMAL(14,2) NOT NULL,
    "valorAvaliacao" DECIMAL(14,2),
    "valorComissaoTotal" DECIMAL(14,2) NOT NULL,
    "percentualComissao" DECIMAL(5,2) NOT NULL,
    "meioPagamento" "PaymentMethod" NOT NULL DEFAULT 'TED',
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "statusComissao" TEXT NOT NULL DEFAULT 'pendente',
    "dataVenda" DATE NOT NULL,
    "contratoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_splits" (
    "id" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "beneficiarioTipo" "CommissionBeneficiaryType" NOT NULL,
    "userId" UUID,
    "nomeBeneficiario" TEXT NOT NULL,
    "documentoPix" TEXT,
    "parcelaNumero" INTEGER NOT NULL DEFAULT 1,
    "totalParcelas" INTEGER NOT NULL DEFAULT 1,
    "valor" DECIMAL(12,2) NOT NULL,
    "percentual" DECIMAL(5,2),
    "dataVencimento" DATE NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDENTE',
    "dataPagamento" TIMESTAMP(3),
    "comprovanteUrl" TEXT,
    "reciboPdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_flows" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tipo" "CashFlowType" NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "dataVencimento" DATE NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDENTE',
    "dataPagamento" TIMESTAMP(3),
    "meioPagamento" "PaymentMethod",
    "isRecorrente" BOOLEAN NOT NULL DEFAULT false,
    "centroCusto" TEXT,
    "observacaoLiquidacao" TEXT,
    "anexoUrl" TEXT,
    "modalidade" "BusinessModality" NOT NULL DEFAULT 'VENDA',
    "saleId" UUID,
    "bookingId" UUID,
    "rentalContractId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "leadId" UUID,
    "propertyId" UUID,
    "tipo" "AppointmentType" NOT NULL DEFAULT 'VISITA',
    "titulo" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'AGENDADO',
    "resultadoVisita" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "detalhes" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_materials" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tamanho" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'pdf',
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_role_status_idx" ON "users"("organizationId", "role", "status");

-- CreateIndex
CREATE INDEX "users_organizationId_lastLeadAssignedAt_idx" ON "users"("organizationId", "lastLeadAssignedAt");

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_userId_date_key" ON "check_ins"("userId", "date");

-- CreateIndex
CREATE INDEX "funnel_stages_funnelId_posicao_idx" ON "funnel_stages"("funnelId", "posicao");

-- CreateIndex
CREATE INDEX "leads_organizationId_corretorId_idx" ON "leads"("organizationId", "corretorId");

-- CreateIndex
CREATE INDEX "leads_organizationId_modalidade_idx" ON "leads"("organizationId", "modalidade");

-- CreateIndex
CREATE INDEX "leads_organizationId_isBolsao_idx" ON "leads"("organizationId", "isBolsao");

-- CreateIndex
CREATE INDEX "leads_organizationId_isClosed_idx" ON "leads"("organizationId", "isClosed");

-- CreateIndex
CREATE INDEX "leads_organizationId_createdAt_idx" ON "leads"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "leads_organizationId_funnelId_isClosed_idx" ON "leads"("organizationId", "funnelId", "isClosed");

-- CreateIndex
CREATE INDEX "leads_funnelId_stageId_idx" ON "leads"("funnelId", "stageId");

-- CreateIndex
CREATE INDEX "leads_organizationId_telefone_idx" ON "leads"("organizationId", "telefone");

-- CreateIndex
CREATE INDEX "lead_timeline_leadId_createdAt_idx" ON "lead_timeline"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "lead_documents_leadId_idx" ON "lead_documents"("leadId");

-- CreateIndex
CREATE INDEX "properties_organizationId_modalidade_faixaPreco_idx" ON "properties"("organizationId", "modalidade", "faixaPreco");

-- CreateIndex
CREATE UNIQUE INDEX "properties_organizationId_slug_key" ON "properties"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "property_units_propertyId_status_idx" ON "property_units"("propertyId", "status");

-- CreateIndex
CREATE INDEX "season_bookings_propertyId_checkInDate_checkOutDate_idx" ON "season_bookings"("propertyId", "checkInDate", "checkOutDate");

-- CreateIndex
CREATE INDEX "season_bookings_organizationId_status_idx" ON "season_bookings"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rental_contracts_codigoContrato_key" ON "rental_contracts"("codigoContrato");

-- CreateIndex
CREATE INDEX "rental_contracts_organizationId_status_idx" ON "rental_contracts"("organizationId", "status");

-- CreateIndex
CREATE INDEX "rental_contracts_organizationId_dataInicio_idx" ON "rental_contracts"("organizationId", "dataInicio");

-- CreateIndex
CREATE UNIQUE INDEX "sales_codigoVenda_key" ON "sales"("codigoVenda");

-- CreateIndex
CREATE INDEX "sales_organizationId_dataVenda_idx" ON "sales"("organizationId", "dataVenda");

-- CreateIndex
CREATE INDEX "sales_leadId_idx" ON "sales"("leadId");

-- CreateIndex
CREATE INDEX "sales_propertyId_idx" ON "sales"("propertyId");

-- CreateIndex
CREATE INDEX "commission_splits_saleId_idx" ON "commission_splits"("saleId");

-- CreateIndex
CREATE INDEX "commission_splits_userId_status_idx" ON "commission_splits"("userId", "status");

-- CreateIndex
CREATE INDEX "cash_flows_organizationId_tipo_dataVencimento_idx" ON "cash_flows"("organizationId", "tipo", "dataVencimento");

-- CreateIndex
CREATE INDEX "cash_flows_organizationId_modalidade_dataVencimento_idx" ON "cash_flows"("organizationId", "modalidade", "dataVencimento");

-- CreateIndex
CREATE INDEX "appointments_organizationId_userId_dataInicio_idx" ON "appointments"("organizationId", "userId", "dataInicio");

-- CreateIndex
CREATE INDEX "appointments_leadId_idx" ON "appointments"("leadId");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_createdAt_idx" ON "audit_logs"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "property_materials_propertyId_idx" ON "property_materials"("propertyId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_stages" ADD CONSTRAINT "funnel_stages_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "funnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "funnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "funnel_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_timeline" ADD CONSTRAINT "lead_timeline_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_timeline" ADD CONSTRAINT "lead_timeline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_documents" ADD CONSTRAINT "lead_documents_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_bookings" ADD CONSTRAINT "season_bookings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_bookings" ADD CONSTRAINT "season_bookings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_bookings" ADD CONSTRAINT "season_bookings_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_bookings" ADD CONSTRAINT "season_bookings_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "property_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_splits" ADD CONSTRAINT "commission_splits_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_splits" ADD CONSTRAINT "commission_splits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_flows" ADD CONSTRAINT "cash_flows_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_flows" ADD CONSTRAINT "cash_flows_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_flows" ADD CONSTRAINT "cash_flows_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "season_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_flows" ADD CONSTRAINT "cash_flows_rentalContractId_fkey" FOREIGN KEY ("rentalContractId") REFERENCES "rental_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_materials" ADD CONSTRAINT "property_materials_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

