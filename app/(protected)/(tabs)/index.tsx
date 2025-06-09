import { View, ScrollView, RefreshControl } from "react-native";
import { useState } from "react";
import { Building, DollarSign, TrendingUp, PiggyBank } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { usePortfolioSummary } from "@/hooks/useFinancials";
import { useProperties } from "@/hooks/useProperties";

export default function Home() {
	const [refreshing, setRefreshing] = useState(false);
	const { data: portfolioSummary, isLoading: portfolioLoading, refetch: refetchPortfolio } = usePortfolioSummary();
	const { data: properties, isLoading: propertiesLoading, refetch: refetchProperties } = useProperties();

	const onRefresh = async () => {
		setRefreshing(true);
		await Promise.all([refetchPortfolio(), refetchProperties()]);
		setRefreshing(false);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('da-DK', {
			style: 'currency',
			currency: 'DKK',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	const formatPercentage = (value: number) => {
		return `${value.toFixed(1)}%`;
	};

	return (
		<ScrollView 
			className="flex-1 bg-background"
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
		>
			<View className="p-6 pt-12">
				<H1 className="text-center mb-2">RentWise Dashboard</H1>
				<Muted className="text-center mb-8">
					Your rental property portfolio overview
				</Muted>

				{portfolioLoading || propertiesLoading ? (
					<View className="flex-1 items-center justify-center py-12">
						<Text>Loading your portfolio...</Text>
					</View>
				) : (
					<>
						{/* Portfolio Summary Cards */}
						<View className="gap-4 mb-8">
							<View className="flex-row gap-4">
								<View className="flex-1 bg-card p-4 rounded-lg border border-border">
									<View className="flex-row items-center gap-2 mb-2">
										<Building className="text-primary" size={20} />
										<Text className="text-sm font-medium text-muted-foreground">Properties</Text>
									</View>
									<Text className="text-2xl font-bold">{portfolioSummary?.totalProperties || 0}</Text>
								</View>
								<View className="flex-1 bg-card p-4 rounded-lg border border-border">
									<View className="flex-row items-center gap-2 mb-2">
										<PiggyBank className="text-primary" size={20} />
										<Text className="text-sm font-medium text-muted-foreground">Total Value</Text>
									</View>
									<Text className="text-2xl font-bold">{formatCurrency(portfolioSummary?.totalValue || 0)}</Text>
								</View>
							</View>
							
							<View className="flex-row gap-4">
								<View className="flex-1 bg-card p-4 rounded-lg border border-border">
									<View className="flex-row items-center gap-2 mb-2">
										<DollarSign className="text-green-600" size={20} />
										<Text className="text-sm font-medium text-muted-foreground">Net Profit</Text>
									</View>
									<Text className="text-2xl font-bold text-green-600">
										{formatCurrency(portfolioSummary?.netProfit || 0)}
									</Text>
								</View>
								<View className="flex-1 bg-card p-4 rounded-lg border border-border">
									<View className="flex-row items-center gap-2 mb-2">
										<TrendingUp className="text-blue-600" size={20} />
										<Text className="text-sm font-medium text-muted-foreground">Avg Return</Text>
									</View>
									<Text className="text-2xl font-bold text-blue-600">
										{formatPercentage(portfolioSummary?.averageReturn || 0)}
									</Text>
								</View>
							</View>
						</View>

						{/* Recent Properties */}
						<View className="mb-8">
							<H2 className="mb-4">Recent Properties</H2>
							{properties && properties.length > 0 ? (
								<View className="gap-3">
									{properties.slice(0, 3).map((property) => (
										<View key={property.property_id} className="bg-card p-4 rounded-lg border border-border">
											<Text className="font-semibold mb-1">{property.address}</Text>
											<View className="flex-row justify-between items-center">
												<Text className="text-sm text-muted-foreground">
													{property.size_sqm ? `${property.size_sqm} m²` : 'Size not specified'}
												</Text>
												<Text className="text-sm font-medium">
													{property.current_value_dkk ? formatCurrency(property.current_value_dkk) : 'Value not set'}
												</Text>
											</View>
										</View>
									))}
								</View>
							) : (
								<View className="bg-card p-6 rounded-lg border border-border items-center">
									<Building className="text-muted-foreground mb-2" size={32} />
									<Text className="text-center text-muted-foreground">
										No properties yet. Add your first property to get started!
									</Text>
								</View>
							)}
						</View>

						{/* Quick Stats */}
						<View className="bg-card p-4 rounded-lg border border-border">
							<H2 className="mb-4">Financial Overview</H2>
							<View className="gap-3">
								<View className="flex-row justify-between">
									<Text className="text-muted-foreground">Total Income</Text>
									<Text className="font-medium text-green-600">
										{formatCurrency(portfolioSummary?.totalIncome || 0)}
									</Text>
								</View>
								<View className="flex-row justify-between">
									<Text className="text-muted-foreground">Total Expenses</Text>
									<Text className="font-medium text-red-600">
										{formatCurrency(portfolioSummary?.totalExpenses || 0)}
									</Text>
								</View>
								<View className="h-px bg-border" />
								<View className="flex-row justify-between">
									<Text className="font-semibold">Net Profit</Text>
									<Text className={`font-bold ${(portfolioSummary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
										{formatCurrency(portfolioSummary?.netProfit || 0)}
									</Text>
								</View>
							</View>
						</View>
					</>
				)}
			</View>
		</ScrollView>
	);
}