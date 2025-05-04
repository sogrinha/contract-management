import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { Contract } from '../models/Contract';
import { RealEstate } from '../models/RealEstate';
import { Owner } from '../models/Owner';
import { Lessee } from '../models/Lessee';
import { EContractKind } from '../models/Contract';
import { storageService } from './storageService';
import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';

interface ContractData {
    contract: Contract;
    owner: Owner;
    lessee?: Lessee;
    realEstate?: RealEstate;
}

export const documentService = {
    async generateContractDocument(
        contractData: ContractData,
        format: 'docx' | 'pdf'
    ): Promise<void> {
        const { contract, owner, lessee, realEstate } = contractData;

        // Função auxiliar para formatar moeda
        const formatCurrency = (value: number): string => {
            return value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        };

        // Função auxiliar para formatar data
        const formatDate = (date: Date): string => {
            return date.toLocaleDateString('pt-BR');
        };

        // Função para formatar data por extenso
        const formatDateExtended = (date: Date): string => {
            const options: Intl.DateTimeFormatOptions = {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            };
            return date.toLocaleDateString('pt-BR', options);
        };

        // Gerar conteúdo do contrato baseado no tipo
        const getContractContent = () => {
            switch (contract.contractKind) {
                case EContractKind.Rental:
                case EContractKind.Rental_With_Administration:
                    return {
                        title: 'CONTRATO DE LOCAÇÃO DE IMÓVEL',
                        sections: [
                            {
                                title: '1. DAS PARTES',
                                content: `LOCADOR: ${owner.fullName}, ${owner.maritalStatus}, portador do RG ${owner.rg} ${owner.issuingBody}, inscrito no CPF ${owner.cpf}, residente e domiciliado em ${owner.street}, ${owner.number}, ${owner.neighborhood}, ${owner.city}/${owner.state}, CEP ${owner.cep}.

LOCATÁRIO: ${lessee?.fullName}, ${lessee?.maritalStatus}, portador do RG ${lessee?.rg} ${lessee?.issuingBody}, inscrito no CPF ${lessee?.cpf}, residente e domiciliado em ${lessee?.street}, ${lessee?.number}, ${lessee?.neighborhood}, ${lessee?.city}/${lessee?.state}, CEP ${lessee?.cep}.`
                            },
                            {
                                title: '2. DO OBJETO',
                                content: `O LOCADOR declara ser proprietário e legítimo possuidor do imóvel situado em ${realEstate?.street}, ${realEstate?.number}, ${realEstate?.neighborhood}, ${realEstate?.city}/${realEstate?.state}, CEP ${realEstate?.cep}, registrado sob matrícula ${realEstate?.municipalRegistration}.`
                            },
                            {
                                title: '3. DO PRAZO',
                                content: `O prazo de locação é de ${contract.duration} meses, iniciando em ${formatDate(contract.startDate)} e terminando em ${formatDate(contract.endDate)}.`
                            },
                            {
                                title: '4. DO VALOR E FORMA DE PAGAMENTO',
                                content: `O valor mensal do aluguel é de ${formatCurrency(contract.paymentValue)}, a ser pago até o dia ${contract.dayPayment} de cada mês.`
                            },
                            ...(contract.contractKind === EContractKind.Rental_With_Administration ? [{
                                title: '5. DA ADMINISTRAÇÃO',
                                content: 'A administração do imóvel será realizada pela IMOBILIÁRIA, que ficará responsável pela gestão do contrato, recebimento dos aluguéis, e intermediação entre LOCADOR e LOCATÁRIO.'
                            }] : [])
                        ],
                        signatures: [
                            { title: 'LOCADOR', name: owner.fullName },
                            { title: 'LOCATÁRIO', name: lessee?.fullName || '______________________' },
                            { title: 'TESTEMUNHA 1', name: '______________________' },
                            { title: 'TESTEMUNHA 2', name: '______________________' }
                        ]
                    };

                case EContractKind.Sale_With_Exclusivity:
                case EContractKind.Sale_without_Exclusivity:
                    return {
                        title: 'CONTRATO DE COMPRA E VENDA DE IMÓVEL',
                        sections: [
                            {
                                title: '1. DAS PARTES',
                                content: `VENDEDOR: ${owner.fullName}, ${owner.maritalStatus}, portador do RG ${owner.rg} ${owner.issuingBody}, inscrito no CPF ${owner.cpf}, residente e domiciliado em ${owner.street}, ${owner.number}, ${owner.neighborhood}, ${owner.city}/${owner.state}, CEP ${owner.cep}.

COMPRADOR: ${lessee?.fullName}, ${lessee?.maritalStatus}, portador do RG ${lessee?.rg} ${lessee?.issuingBody}, inscrito no CPF ${lessee?.cpf}, residente e domiciliado em ${lessee?.street}, ${lessee?.number}, ${lessee?.neighborhood}, ${lessee?.city}/${lessee?.state}, CEP ${lessee?.cep}.`
                            },
                            {
                                title: '2. DO OBJETO',
                                content: `O VENDEDOR declara ser proprietário e legítimo possuidor do imóvel situado em ${realEstate?.street}, ${realEstate?.number}, ${realEstate?.neighborhood}, ${realEstate?.city}/${realEstate?.state}, CEP ${realEstate?.cep}, registrado sob matrícula ${realEstate?.municipalRegistration}.`
                            },
                            {
                                title: '3. DO VALOR E FORMA DE PAGAMENTO',
                                content: `O valor total da venda é de ${formatCurrency(contract.paymentValue)}, a ser pago conforme condições estabelecidas neste contrato.`
                            }
                        ],
                        signatures: [
                            { title: 'VENDEDOR', name: owner.fullName },
                            { title: 'COMPRADOR', name: lessee?.fullName || '______________________' },
                            { title: 'TESTEMUNHA 1', name: '______________________' },
                            { title: 'TESTEMUNHA 2', name: '______________________' }
                        ]
                    };

                default:
                    throw new Error('Tipo de contrato não suportado');
            }
        };

        const contractContent = getContractContent();

        if (format === 'docx') {
            // Gerar documento DOCX
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            text: contractContent.title,
                            heading: HeadingLevel.HEADING_1,
                            alignment: 'center',
                            spacing: { before: 240, after: 240 }
                        }),
                        ...contractContent.sections.flatMap(section => [
                            new Paragraph({
                                text: section.title,
                                heading: HeadingLevel.HEADING_2,
                                spacing: { before: 240, after: 120 }
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: section.content,
                                        size: 24
                                    })
                                ],
                                spacing: { before: 120, after: 120 }
                            })
                        ])
                    ]
                }]
            });

            // Usar Blob em vez de Buffer
            const blob = await Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `contrato_${contract.identifier || new Date().getTime()}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } else {
            // Gerar documento PDF com layout melhorado
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]); // Tamanho A4
            const { width, height } = page.getSize();
            const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            // Configurações de estilo
            const margin = 50;
            const titleSize = 16;
            const sectionTitleSize = 12;
            const contentSize = 10;
            const lineHeight = contentSize * 1.5;
            const sectionSpacing = 20;

            // Função auxiliar para desenhar texto com quebra de linha
            const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, page: PDFPage) => {
                const words = text.split(' ');
                let currentLine = '';
                let currentY = y;

                for (const word of words) {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const lineWidth = helvetica.widthOfTextAtSize(testLine, contentSize);

                    if (lineWidth > maxWidth) {
                        page.drawText(currentLine, {
                            x,
                            y: currentY,
                            size: contentSize,
                            font: helvetica,
                            color: rgb(0, 0, 0),
                        });
                        currentY -= lineHeight;
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                }

                if (currentLine) {
                    page.drawText(currentLine, {
                        x,
                        y: currentY,
                        size: contentSize,
                        font: helvetica,
                        color: rgb(0, 0, 0),
                    });
                    currentY -= lineHeight;
                }

                return currentY;
            };

            // Função para criar e configurar uma nova página
            const createNewPage = () => {
                const newPage = pdfDoc.addPage([595.28, 841.89]);
                return {
                    page: newPage,
                    yPosition: height - margin
                };
            };

            let currentPageData = {
                page,
                yPosition: height - margin
            };

            // Cabeçalho com data
            const currentDate = formatDateExtended(new Date());
            currentPageData.page.drawText(currentDate, {
                x: width - margin - helvetica.widthOfTextAtSize(currentDate, contentSize),
                y: currentPageData.yPosition,
                size: contentSize,
                font: helvetica,
                color: rgb(0.4, 0.4, 0.4),
            });
            currentPageData.yPosition -= lineHeight * 2;

            // Título do contrato
            const titleWidth = helveticaBold.widthOfTextAtSize(contractContent.title, titleSize);
            currentPageData.page.drawText(contractContent.title, {
                x: (width - titleWidth) / 2,
                y: currentPageData.yPosition,
                size: titleSize,
                font: helveticaBold,
                color: rgb(0, 0, 0),
            });
            currentPageData.yPosition -= titleSize * 2;

            // Número do contrato
            const contractNumber = `Contrato Nº: ${contract.identifier || new Date().getTime()}`;
            currentPageData.page.drawText(contractNumber, {
                x: margin,
                y: currentPageData.yPosition,
                size: contentSize,
                font: helvetica,
                color: rgb(0.4, 0.4, 0.4),
            });
            currentPageData.yPosition -= lineHeight * 2;

            // Seções do contrato
            for (const section of contractContent.sections) {
                // Verificar se precisa de nova página
                if (currentPageData.yPosition < margin * 3) {
                    currentPageData = createNewPage();
                }

                // Título da seção
                currentPageData.page.drawText(section.title, {
                    x: margin,
                    y: currentPageData.yPosition,
                    size: sectionTitleSize,
                    font: helveticaBold,
                    color: rgb(0, 0, 0),
                });
                currentPageData.yPosition -= sectionTitleSize * 1.5;

                // Conteúdo da seção
                const lines = section.content.split('\n');
                for (const line of lines) {
                    if (currentPageData.yPosition < margin * 3) {
                        currentPageData = createNewPage();
                    }
                    currentPageData.yPosition = drawWrappedText(
                        line,
                        margin,
                        currentPageData.yPosition,
                        width - (margin * 2),
                        currentPageData.page
                    );
                }
                currentPageData.yPosition -= sectionSpacing;
            }

            // Verificar se precisa de nova página para assinaturas
            if (currentPageData.yPosition < margin * 6) {
                currentPageData = createNewPage();
            }

            // Local e data
            const cityDate = `${owner.city}, ${formatDateExtended(new Date())}`;
            currentPageData.page.drawText(cityDate, {
                x: (width - helvetica.widthOfTextAtSize(cityDate, contentSize)) / 2,
                y: currentPageData.yPosition,
                size: contentSize,
                font: helvetica,
                color: rgb(0, 0, 0),
            });

            // Assinaturas
            currentPageData.yPosition -= sectionSpacing * 3;
            const signatureWidth = width - (margin * 2);
            const signatureSpacing = signatureWidth / (contractContent.signatures.length);

            contractContent.signatures.forEach((signature, index) => {
                const x = margin + (signatureSpacing * index) + (signatureSpacing / 2);

                // Linha da assinatura
                currentPageData.page.drawLine({
                    start: { x: x - (signatureSpacing / 3), y: currentPageData.yPosition },
                    end: { x: x + (signatureSpacing / 3), y: currentPageData.yPosition },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });

                // Nome/espaço para assinatura
                const nameY = currentPageData.yPosition - lineHeight;
                const nameText = signature.name;
                const nameWidth = helvetica.widthOfTextAtSize(nameText, contentSize);
                currentPageData.page.drawText(nameText, {
                    x: x - (nameWidth / 2),
                    y: nameY,
                    size: contentSize,
                    font: helvetica,
                    color: rgb(0, 0, 0),
                });

                // Título da assinatura
                const titleY = nameY - lineHeight;
                const titleText = signature.title;
                const titleWidth = helvetica.widthOfTextAtSize(titleText, contentSize);
                currentPageData.page.drawText(titleText, {
                    x: x - (titleWidth / 2),
                    y: titleY,
                    size: contentSize,
                    font: helvetica,
                    color: rgb(0, 0, 0),
                });
            });

            // Rodapé
            const footerText = 'Este documento é parte integrante do sistema de gestão imobiliária.';
            const footerY = margin / 2;
            currentPageData.page.drawText(footerText, {
                x: (width - helvetica.widthOfTextAtSize(footerText, 8)) / 2,
                y: footerY,
                size: 8,
                font: helvetica,
                color: rgb(0.4, 0.4, 0.4),
            });

            // Salvar e baixar o PDF
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `contrato_${contract.identifier || new Date().getTime()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    }
}; 
