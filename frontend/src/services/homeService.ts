import {
    collection,
    getDocs,
    query,
    where,
    Timestamp,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { RealEstate, EStatusRealEstate } from '../models/RealEstate';
import { Contract, EContractKind, EStatus } from '../models/Contract';

export interface HomeStats {
    realEstate: {
        total: number;
        available: number;
        leased: number;
        sold: number;
        underMaintenance: number;
        occupancyRate: number;
    };
    financial: {
        totalRevenue: number;
        monthlyRevenue: number;
        averageRent: number;
        projectedAnnualRevenue: number;
        revenueByMonth: Array<{
            month: string;
            revenue: number;
        }>;
    };
    contracts: {
        total: number;
        active: number;
        completed: number;
        cancelled: number;
        distribution: Array<{
            type: string;
            count: number;
        }>;
    };
    propertyDistribution: Array<{
        name: string;
        value: number;
    }>;
}

export async function getHomeStats(): Promise<HomeStats> {
    try {
        // Buscar imóveis
        const realEstatesQuery = query(collection(db, 'realEstates'));
        const realEstatesSnapshot = await getDocs(realEstatesQuery);
        const realEstates = realEstatesSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        })) as RealEstate[];

        // Buscar contratos
        const contractsQuery = query(collection(db, 'contracts'));
        const contractsSnapshot = await getDocs(contractsQuery);
        const contracts = contractsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        })) as Contract[];

        // Calcular estatísticas de imóveis
        const totalProperties = realEstates.length;
        const available = realEstates.filter(re => re.statusRealEstate === EStatusRealEstate.Available).length;
        const leased = realEstates.filter(re => re.statusRealEstate === EStatusRealEstate.Leased).length;
        const sold = realEstates.filter(re => re.statusRealEstate === EStatusRealEstate.Sold).length;
        const underMaintenance = realEstates.filter(re => re.statusRealEstate === 'Em Manutenção').length;
        const occupancyRate = totalProperties > 0 ? (leased / totalProperties) * 100 : 0;

        // Calcular estatísticas financeiras
        const activeContracts = contracts.filter(c => c.status === EStatus.Active);
        const totalRevenue = activeContracts.reduce((acc, contract) => acc + (contract.paymentValue || 0), 0);
        const averageRent = activeContracts.length > 0 ? totalRevenue / activeContracts.length : 0;

        // Calcular receita por mês (últimos 6 meses)
        const today = new Date();
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
            const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthContracts = activeContracts.filter(contract => {
                const startDate = contract.startDate instanceof Date
                    ? contract.startDate
                    : (contract.startDate as unknown as Timestamp)?.toDate?.() || new Date(contract.startDate);
                return startDate.getMonth() === month.getMonth() &&
                    startDate.getFullYear() === month.getFullYear();
            });
            const revenue = monthContracts.reduce((acc, contract) => acc + (contract.paymentValue || 0), 0);
            return {
                month: monthNames[month.getMonth()],
                revenue
            };
        }).reverse();

        // Calcular distribuição de contratos
        const contractDistribution = Object.values(EContractKind).map(type => ({
            type,
            count: contracts.filter(c => c.contractKind === type).length
        }));

        // Calcular distribuição de imóveis
        const propertyDistribution = [
            { name: 'Disponível', value: available },
            { name: 'Alugado', value: leased },
            { name: 'Vendido', value: sold },
            { name: 'Em Manutenção', value: underMaintenance }
        ];

        return {
            realEstate: {
                total: totalProperties,
                available,
                leased,
                sold,
                underMaintenance,
                occupancyRate
            },
            financial: {
                totalRevenue,
                monthlyRevenue: revenueByMonth[revenueByMonth.length - 1]?.revenue || 0,
                averageRent,
                projectedAnnualRevenue: totalRevenue * 12,
                revenueByMonth
            },
            contracts: {
                total: contracts.length,
                active: contracts.filter(c => c.status === EStatus.Active).length,
                completed: contracts.filter(c => c.status === EStatus.Done).length,
                cancelled: contracts.filter(c => c.status === EStatus.Voided).length,
                distribution: contractDistribution
            },
            propertyDistribution
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
    }
} 
