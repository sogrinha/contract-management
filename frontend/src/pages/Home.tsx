import React from 'react';
import { useEffect, useState } from 'react';
import { LineChart } from '../components/charts/LineChart';
import { KPICard } from '../components/KPICard';
import { homeService } from '../services/homeService';
import { Building2, Wallet, Home as HomeIcon, Users, BarChart, TrendingUp } from 'lucide-react';

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

const HomePage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [contratosMensais, setContratosMensais] = useState<{ name: string; value: number; }[]>([]);
    const [receitaMensal, setReceitaMensal] = useState<{ name: string; value: number; }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Busca dados do dashboard
                const data = await homeService.getDashboardData();
                setDashboardData(data);

                // Busca dados dos gráficos
                const contratosMensaisData = await homeService.getContratosMensais();
                setContratosMensais(
                    contratosMensaisData.labels.map((label, index) => ({
                        name: label,
                        value: contratosMensaisData.data[index]
                    }))
                );

                const receitaMensalData = await homeService.getReceitaMensal();
                setReceitaMensal(
                    receitaMensalData.labels.map((label, index) => ({
                        name: label,
                        value: receitaMensalData.data[index]
                    }))
                );
            } catch (error) {
                console.error('Erro ao carregar dados do dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading || !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Visão geral do seu negócio imobiliário</p>
            </div>

            {/* Grid de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <KPICard
                    title="Total de Imóveis"
                    value={dashboardData.totalImoveis}
                    icon={<Building2 />}
                />
                <KPICard
                    title="Imóveis Disponíveis"
                    value={dashboardData.imoveisDisponiveis}
                    icon={<HomeIcon />}
                />
                <KPICard
                    title="Imóveis Alugados"
                    value={dashboardData.imoveisAlugados}
                    icon={<Users />}
                />
                <KPICard
                    title="Receita Mensal"
                    value={dashboardData.receitaMensal}
                    isMonetary={true}
                    icon={<Wallet />}
                />
                <KPICard
                    title="Taxa de Ocupação"
                    value={dashboardData.taxaOcupacao.toFixed(1)}
                    isPercentage={true}
                    icon={<BarChart />}
                />
                <KPICard
                    title="Média de Aluguel"
                    value={dashboardData.mediaAluguel}
                    isMonetary={true}
                    icon={<TrendingUp />}
                />
            </div>

            {/* Grid de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChart
                    data={contratosMensais}
                    title="Contratos por Mês"
                    color="#2563eb"
                />
                <LineChart
                    data={receitaMensal}
                    title="Receita Mensal"
                    color="#059669"
                />
            </div>
        </div>
    );
};

export default HomePage; 
