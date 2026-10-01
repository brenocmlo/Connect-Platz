import bcrypt from "bcryptjs";

async function testSecurity() {
  console.log("=================================================");
  console.log("TESTE DE CONFORMIDADE: BCRYPT E MÁSCARA RLS LGPD");
  console.log("=================================================");

  // 1. TESTE DE CRIPTOGRAFIA BCRYPT (Salt Rounds = 12)
  console.log("\n[1] Testando Criptografia de Senha com Bcrypt (salt 12)...");
  const plainPassword = "RobsonCarvalho@2026Connect";
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(plainPassword, salt);

  console.log("Hash Bcrypt gerado:", hash);
  console.log("Prefixo Bcrypt válido:", hash.startsWith("$2a$") || hash.startsWith("$2b$"));

  const matchesCorrect = await bcrypt.compare(plainPassword, hash);
  const matchesWrong = await bcrypt.compare("SenhaIncorreta", hash);

  console.log("Validação com senha correta:", matchesCorrect ? "✔ APROVADO" : "❌ FALHOU");
  console.log("Rejeição de senha errada:", !matchesWrong ? "✔ APROVADO" : "❌ FALHOU");

  if (!matchesCorrect || matchesWrong) {
    throw new Error("Falha no teste do Bcrypt!");
  }

  // 2. TESTE DE ISOLAMENTO E MÁSCARA LGPD (ROW LEVEL SECURITY)
  console.log("\n[2] Testando Mascaramento LGPD de Contatos em Leads Ativos...");

  function maskLead(lead, userContext) {
    const isOwner = lead.corretorId === userContext.userId;
    const isAdmin = ["ADMINISTRADOR", "DIRETOR", "GERENTE"].includes(userContext.role);

    if (isOwner || isAdmin) {
      return lead;
    }

    const clean = lead.telefone.replace(/\D/g, "");
    const ddd = clean.slice(0, 2);
    const last4 = clean.slice(-4);
    const maskedPhone = `(${ddd}) 9****-${last4}`;

    return {
      ...lead,
      telefone: maskedPhone,
    };
  }

  const mockLead = {
    id: "lead-abc-123",
    nome: "Comprador de Luxo Fortaleza",
    telefone: "85991234567",
    corretorId: "corretor-titular-lucas",
  };

  const contextTitular = { userId: "corretor-titular-lucas", role: "CORRETOR" };
  const contextOutroCorretor = { userId: "corretor-mariana", role: "CORRETOR" };
  const contextAdmin = { userId: "admin-robson", role: "ADMINISTRADOR" };

  const viewTitular = maskLead(mockLead, contextTitular);
  const viewOutro = maskLead(mockLead, contextOutroCorretor);
  const viewAdmin = maskLead(mockLead, contextAdmin);

  console.log("Telefone visto pelo Corretor Titular:", viewTitular.telefone);
  console.log("Telefone visto por Outro Corretor (Mascarado):", viewOutro.telefone);
  console.log("Telefone visto pelo Administrador:", viewAdmin.telefone);

  if (viewOutro.telefone !== "(85) 9****-4567") {
    throw new Error("Máscara incorreta!");
  }
  if (viewTitular.telefone !== "85991234567" || viewAdmin.telefone !== "85991234567") {
    throw new Error("Dono ou Admin não tiveram acesso completo!");
  }

  console.log("\n✔ TODAS AS REGRAS DE BCRYPT E RLS VALIDADAS COM SUCESSO!");
}

testSecurity().catch(console.error);
