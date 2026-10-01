import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface CommissionReceiptData {
  codigoVenda: string;
  beneficiarioNome: string;
  beneficiarioTipo: string;
  documentoPix?: string | null;
  valor: number;
  parcelaNumero: number;
  totalParcelas: number;
  dataPagamento: string;
  imovelNome: string;
  unidadeNumero?: string;
  compradorNome: string;
}

export function generateCommissionReceiptPdf(data: CommissionReceiptData) {
  const doc = new jsPDF();

  // CABEÇALHO TIMBRADO CONNECT PLATZ
  doc.setFillColor(10, 14, 23); // #0A0E17
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CONNECT PLATZ IMOBILIÁRIA", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(217, 187, 76); // #D9BB4C
  doc.text("RECIBO OFICIAL DE LIQUIDAÇÃO DE COMISSÃO", 14, 28);

  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text(`Ref. Venda #${data.codigoVenda}`, 160, 28);

  // DADOS DO BENEFICIÁRIO E DA TRANSAÇÃO
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Dados do Beneficiário", 14, 52);

  const formattedValor = data.valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  autoTable(doc, {
    startY: 56,
    theme: "grid",
    headStyles: { fillColor: [18, 102, 199], textColor: [255, 255, 255] },
    head: [["Campo", "Descrição"]],
    body: [
      ["Nome do Beneficiário", data.beneficiarioNome],
      ["Categoria / Função", data.beneficiarioTipo],
      ["Chave PIX Cadastrada", data.documentoPix || "Transferência Bancária / TED"],
      ["Parcela", `${data.parcelaNumero} de ${data.totalParcelas}`],
      ["Valor Líquido Quitado", formattedValor],
      ["Data de Liquidação", data.dataPagamento],
    ],
  });

  // DADOS DA OPERAÇÃO IMOBILIÁRIA
  const nextY = (doc as any).lastAutoTable.finalY + 14;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. Dados da Negociação Imobiliária", 14, nextY);

  autoTable(doc, {
    startY: nextY + 4,
    theme: "grid",
    headStyles: { fillColor: [217, 187, 76], textColor: [10, 14, 23] },
    head: [["Propriedade", "Unidade", "Comprador / Titular"]],
    body: [
      [data.imovelNome, data.unidadeNumero || "Unidade Padrão", data.compradorNome],
    ],
  });

  // DECLARAÇÃO DE QUITAÇÃO & TERMO DE CONFORMIDADE
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const termo =
    "Declaro para os devidos fins de direito que recebi da Connect Platz Imobiliária a quantia líquida acima descrita, referente à minha participação comissional na intermediação imobiliária, dando plena e irrevogável quitação da referida parcela.";
  doc.text(doc.splitTextToSize(termo, 180), 14, finalY);

  // LINHA DE ASSINATURA
  doc.setDrawColor(150, 150, 150);
  doc.line(14, finalY + 35, 100, finalY + 35);
  doc.setFontSize(9);
  doc.text(data.beneficiarioNome, 14, finalY + 40);
  doc.text("Assinatura do Beneficiário / Corretor", 14, finalY + 45);

  doc.line(110, finalY + 35, 196, finalY + 35);
  doc.text("Diretoria Financeira Connect Platz", 110, finalY + 40);
  doc.text("CNPJ: 00.000.000/0001-00", 110, finalY + 45);

  // DOWNLOAD DO ARQUIVO PDF
  doc.save(`Recibo_Comissao_${data.codigoVenda}_${data.beneficiarioNome.replace(/\s+/g, "_")}.pdf`);
}
