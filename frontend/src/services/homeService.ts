import { db } from './firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { EStatusRealEstate, RealEstate } from '../models/RealEstate';
import { EStatus } from '../models/Contract';

interface DashboardData {
    totalImoveis: number;
    imoveisDisponiveis: number;
    imoveisAlugados: number;
    imoveisVendidos: number;
    receitaMensal: number;
    totalContratos: number;
    taxaOcupacao: number;
    mediaAluguel: number;
}

interface ChartData {
    labels: string[];
    data: number[];
}

export const homeService = {
    async getDashboardData(): Promise<DashboardData> {
        try {
            // Busca imóveis
            const imoveisRef = collection(db, 'realEstates');
            const imoveisSnapshot = await getDocs(imoveisRef);
            const totalImoveis = imoveisSnapshot.size;

            // Contadores por status
            let imoveisDisponiveis = 0;
            let imoveisAlugados = 0;
            let imoveisVendidos = 0;

            imoveisSnapshot.forEach((doc) => {
                const imovel = doc.data() as RealEstate;
                switch (imovel.statusRealEstate) {
                    case EStatusRealEstate.Available:
                        imoveisDisponiveis++;
                        break;
                    case EStatusRealEstate.Leased:
                        imoveisAlugados++;
                        break;
                    case EStatusRealEstate.Sold:
                        imoveisVendidos++;
                        break;
                }
            });

            // Busca contratos
            const contratosRef = collection(db, 'contratos');
            const contratosSnapshot = await getDocs(contratosRef);
            const totalContratos = contratosSnapshot.size;

            // Calcula receita mensal (soma dos aluguéis ativos)
            let receitaMensal = 0;
            let somaAlugueis = 0;
            let countAlugueis = 0;

            await Promise.all(contratosSnapshot.docs.map(async (doc) => {
                const contrato = doc.data();
                if (contrato.status === EStatus.Active) {
                    if (contrato.valorAluguel) {
                        receitaMensal += contrato.valorAluguel;
                        somaAlugueis += contrato.valorAluguel;
                        countAlugueis++;
                    }
                }
            }));

            // Calcula métricas
            const taxaOcupacao = totalImoveis > 0 ? (imoveisAlugados / totalImoveis) * 100 : 0;
            const mediaAluguel = countAlugueis > 0 ? somaAlugueis / countAlugueis : 0;

            return {
                totalImoveis,
                imoveisDisponiveis,
                imoveisAlugados,
                imoveisVendidos,
                receitaMensal,
                totalContratos,
                taxaOcupacao,
                mediaAluguel
            };
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
            throw error;
        }
    },

    async getContratosMensais(): Promise<ChartData> {
        try {
            const contratosRef = collection(db, 'contratos');
            const contratosDocs = await getDocs(contratosRef);

            const hoje = new Date();
            const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
                const data = new Date();
                data.setMonth(hoje.getMonth() - i);
                return data;
            }).reverse();

            const labels = ultimos6Meses.map(data =>
                data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
            );

            const data = ultimos6Meses.map(mesRef => {
                return contratosDocs.docs.filter(doc => {
                    const contrato = doc.data();
                    const dataInicio = contrato.dataInicio?.toDate();
                    return dataInicio &&
                        dataInicio.getMonth() === mesRef.getMonth() &&
                        dataInicio.getFullYear() === mesRef.getFullYear();
                }).length;
            });

            return { labels, data };
        } catch (error) {
            console.error('Erro ao buscar dados de contratos mensais:', error);
            throw error;
        }
    },

    async getReceitaMensal(): Promise<ChartData> {
        try {
            const contratosRef = collection(db, 'contratos');
            const contratosDocs = await getDocs(contratosRef);

            const hoje = new Date();
            const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
                const data = new Date();
                data.setMonth(hoje.getMonth() - i);
                return data;
            }).reverse();

            const labels = ultimos6Meses.map(data =>
                data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
            );

            const data = ultimos6Meses.map(mesRef => {
                return contratosDocs.docs
                    .filter(doc => {
                        const contrato = doc.data();
                        return contrato.status === EStatus.Active;
                    })
                    .reduce((total, doc) => {
                        const contrato = doc.data();
                        return total + (contrato.valorAluguel || 0);
                    }, 0);
            });

            return { labels, data };
        } catch (error) {
            console.error('Erro ao buscar dados de receita mensal:', error);
            throw error;
        }
    }
}; 
