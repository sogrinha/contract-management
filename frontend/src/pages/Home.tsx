import { useEffect, useState } from 'react';
import { Building2, DollarSign, Users, Home as HomeIcon, TrendingUp, FileText } from 'lucide-react';
import KPICard from '../components/cards/KPICard';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import { getHomeStats, HomeStats } from '../services/homeService';
import { formatCurrency } from '../utils/formatters';

const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<HomeStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getHomeStats();
                setStats(data);
                setError(null);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setError('Erro ao carregar dados do dashboard. Por favor, tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-myPrimary"></div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-500 text-center">
                    <p className="text-xl font-semibold mb-2">Ops! Algo deu errado.</p>
                    <p>{error || 'Não foi possível carregar os dados.'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-myPrimary text-white rounded hover:bg-myPrimary/90"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Última atualização: {new Date().toLocaleString('pt-BR')}
                </div>
            </div>

            {/* KPI Cards - Primeira Linha */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPICard
                    title="Total de Imóveis"
                    value={stats.realEstate.total}
                    icon={<Building2 className="w-6 h-6" />}
                    color="blue"
                    trend={null}
                    trendLabel=""
                    subtitle={`${stats.realEstate.available} disponíveis`}
                />
                <KPICard
                    title="Receita Mensal"
                    value={formatCurrency(stats.financial.monthlyRevenue)}
                    icon={<DollarSign className="w-6 h-6" />}
                    color="green"
                    trend={8.2}
                    trendLabel="vs. mês anterior"
                    subtitle="vs. mês anterior"
                />
                <KPICard
                    title="Taxa de Ocupação"
                    value={`${stats.realEstate.occupancyRate.toFixed(1)}%`}
                    icon={<Users className="w-6 h-6" />}
                    color="yellow"
                    trend={2.5}
                    trendLabel="vs. mês anterior"
                    subtitle={`${stats.realEstate.leased} imóveis alugados`}
                />
            </div>

            {/* KPI Cards - Segunda Linha */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPICard
                    title="Contratos Ativos"
                    value={stats.contracts.active}
                    icon={<FileText className="w-6 h-6" />}
                    color="indigo"
                    trend={null}
                    trendLabel=""
                    subtitle={`de ${stats.contracts.total} contratos`}
                />
                <KPICard
                    title="Média de Aluguel"
                    value={formatCurrency(stats.financial.averageRent)}
                    icon={<HomeIcon className="w-6 h-6" />}
                    color="purple"
                    trend={null}
                    trendLabel=""
                    subtitle="por imóvel"
                />
                <KPICard
                    title="Projeção Anual"
                    value={formatCurrency(stats.financial.projectedAnnualRevenue)}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="pink"
                    trend={5.8}
                    trendLabel="vs. ano anterior"
                    subtitle="crescimento esperado"
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Receita Mensal</h3>
                    <BarChart
                        data={stats.financial.revenueByMonth}
                        dataKey="month"
                        barKey="revenue"
                        title=""
                    />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Distribuição de Imóveis</h3>
                    <PieChart
                        data={stats.propertyDistribution}
                        title=""
                    />
                </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* Resumo Financeiro */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Resumo Financeiro</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Receita Total (Ano)</span>
                            <span className="font-medium">{formatCurrency(stats.financial.projectedAnnualRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Média Mensal</span>
                            <span className="font-medium">{formatCurrency(stats.financial.monthlyRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Média por Imóvel</span>
                            <span className="font-medium">{formatCurrency(stats.financial.averageRent)}</span>
                        </div>
                    </div>
                </div>

                {/* Indicadores de Performance */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Status dos Contratos</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Ativos</span>
                            <span className="font-medium text-green-600">{stats.contracts.active}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Concluídos</span>
                            <span className="font-medium text-blue-600">{stats.contracts.completed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Cancelados</span>
                            <span className="font-medium text-red-600">{stats.contracts.cancelled}</span>
                        </div>
                    </div>
                </div>

                {/* Metas e Objetivos */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Status dos Imóveis</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-600">Taxa de Ocupação</span>
                                <span className="font-medium">{stats.realEstate.occupancyRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-myPrimary rounded-full h-2 transition-all duration-500"
                                    style={{ width: `${stats.realEstate.occupancyRate}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-600 block">Disponíveis</span>
                                <span className="text-xl font-medium text-green-600">{stats.realEstate.available}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 block">Alugados</span>
                                <span className="text-xl font-medium text-blue-600">{stats.realEstate.leased}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 block">Vendidos</span>
                                <span className="text-xl font-medium text-purple-600">{stats.realEstate.sold}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 block">Em Manutenção</span>
                                <span className="text-xl font-medium text-orange-600">{stats.realEstate.underMaintenance}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage; 
