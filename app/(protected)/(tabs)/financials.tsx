import { View, ScrollView, RefreshControl } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { DollarSign, Plus, TrendingUp, TrendingDown, Calendar } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { usePortfolioSummary } from "@/hooks/useFinancials";

export default function Financials() {
	const [refreshing, setRefreshing] = useState(false);
	const { data: portfolioSummary, isLoading, refetch } = usePortfolioSummary();

	const onRefresh = async () => {
		setRefreshing(true);
		await refetch();
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
		<View className="flex-1 bg-background">
			<ScrollView 
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<View className="p-6 pt-12">
					<View className="flex-row items-center justify-between mb-6">
						<View>
							<H1>Financials</H1>
							<Muted>Track income and expenses</Muted>
						</View>
						<Button
							size="default"
							variant="default"
							onPress={() => router.push("/(protected)/add-transaction")}
							className="flex-row items-center gap-2"
						>
							<Plus size={16} className="text-primary-foreground" />
							<Text>Add</Text>
						</Button>
					</View>

					{isLoading ? (
						<View className="flex-1 items-center justify-center py-12">
							<Text>Loading financial data...</Text>
						</View>
					) : (
						<>
							{/* Financial Summary */}
							<View className="gap-4 mb-8">
								<View className="bg-card p-4 rounded-lg border border-border">
									<View className="flex-row items-center gap-2 mb-3">
										<TrendingUp className="text-green-600" size={20} />
										<Text className="font-semibold">Total Income</Text>
									</View>
									<Text className="text-2xl font-bold text-green-600">
										{formatCurrency(portfolioSummary?.totalIncome || 0)}
									</Text>
								</View>

								<View className="bg-card p-4 rounded-lg border border-border">
									<View className="flex-row items-center gap-2 mb-3">
										<TrendingDown className="text-red-600" size={20} />
										<Text className="font-semibold">Total Expenses</Text>
									</View>
									<Text className="text-2xl font-bold text-red-600">
										{formatCurrency(portfolioSummary?.totalExpenses || 0)}
									</Text>
								</View>

								<View className="bg-card p-4 rounded-lg border border-border">
									<View className="flex-row items-center gap-2 mb-3">
										<DollarSign className="text-blue-600" size={20} />
										<Text className="font-semibold">Net Profit</Text>
									</View>
									<Text className={`text-2xl font-bold ${(portfolioSummary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
										{formatCurrency(portfolioSummary?.netProfit || 0)}
									</Text>
								</View>
							</View>

							{/* Performance Metrics */}
							<View className="bg-card p-4 rounded-lg border border-border mb-8">
								<H2 className="mb-4">Performance</H2>
								<View className="gap-3">
									<View className="flex-row justify-between items-center">
										<Text className="text-muted-foreground">Average Return Rate</Text>
										<Text className={`font-bold ${(portfolioSummary?.averageReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
											{formatPercentage(portfolioSummary?.averageReturn || 0)}
										</Text>
									</View>
									<View className="flex-row justify-between items-center">
										<Text className="text-muted-foreground">Total Portfolio Value</Text>
										<Text className="font-semibold">
											{formatCurrency(portfolioSummary?.totalValue || 0)}
										</Text>
									</View>
									<View className="flex-row justify-between items-center">
										<Text className="text-muted-foreground">Properties Count</Text>
										<Text className="font-semibold">
											{portfolioSummary?.totalProperties || 0}
										</Text>
									</View>
								</View>
							</View>

							{/* Quick Actions */}
							<View className="bg-card p-4 rounded-lg border border-border">
								<H2 className="mb-4">Quick Actions</H2>
								<View className="gap-3">
									<Button
										variant="outline"
										size="default"
										onPress={() => router.push("/(protected)/add-transaction")}
										className="flex-row items-center justify-center gap-2"
									>
										<Plus size={16} />
										<Text>Add Transaction</Text>
									</Button>
									<Button
										variant="outline"
										size="default"
										onPress={() => router.push("/(protected)/financial-reports")}
										className="flex-row items-center justify-center gap-2"
									>
										<Calendar size={16} />
										<Text>View Reports</Text>
									</Button>
								</View>
							</View>
						</>
					)}
				</View>
			</ScrollView>
		</View>
	);
}