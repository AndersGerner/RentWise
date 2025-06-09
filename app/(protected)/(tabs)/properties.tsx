import { View, ScrollView, RefreshControl, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Building, Plus, MapPin, Calendar, DollarSign } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/useProperties";

export default function Properties() {
	const [refreshing, setRefreshing] = useState(false);
	const { data: properties, isLoading, refetch } = useProperties();

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

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('da-DK');
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
							<H1>Properties</H1>
							<Muted>Manage your rental properties</Muted>
						</View>
						<Button
							size="default"
							variant="default"
							onPress={() => router.push("/(protected)/add-property")}
							className="flex-row items-center gap-2"
						>
							<Plus size={16} className="text-primary-foreground" />
							<Text>Add</Text>
						</Button>
					</View>

					{isLoading ? (
						<View className="flex-1 items-center justify-center py-12">
							<Text>Loading properties...</Text>
						</View>
					) : properties && properties.length > 0 ? (
						<View className="gap-4">
							{properties.map((property) => (
								<Pressable
									key={property.property_id}
									onPress={() => router.push(`/(protected)/property/${property.property_id}`)}
									className="bg-card p-4 rounded-lg border border-border active:opacity-70"
								>
									<View className="flex-row items-start justify-between mb-3">
										<View className="flex-1">
											<Text className="font-semibold text-lg mb-1">{property.address}</Text>
											<View className="flex-row items-center gap-1 mb-2">
												<MapPin size={14} className="text-muted-foreground" />
												<Text className="text-sm text-muted-foreground">
													{(property as any).property_types?.name || 'Property'}
												</Text>
											</View>
										</View>
										<Building className="text-primary" size={24} />
									</View>

									<View className="flex-row justify-between items-center">
										<View className="flex-row items-center gap-4">
											{property.size_sqm && (
												<View className="flex-row items-center gap-1">
													<Text className="text-sm text-muted-foreground">Size:</Text>
													<Text className="text-sm font-medium">{property.size_sqm} m²</Text>
												</View>
											)}
											{property.purchase_date && (
												<View className="flex-row items-center gap-1">
													<Calendar size={12} className="text-muted-foreground" />
													<Text className="text-sm text-muted-foreground">
														{formatDate(property.purchase_date)}
													</Text>
												</View>
											)}
										</View>
										{property.current_value_dkk && (
											<View className="flex-row items-center gap-1">
												<DollarSign size={14} className="text-green-600" />
												<Text className="font-semibold text-green-600">
													{formatCurrency(property.current_value_dkk)}
												</Text>
											</View>
										)}
									</View>
								</Pressable>
							))}
						</View>
					) : (
						<View className="flex-1 items-center justify-center py-12">
							<Building className="text-muted-foreground mb-4" size={48} />
							<Text className="text-xl font-semibold mb-2">No Properties Yet</Text>
							<Muted className="text-center mb-6">
								Add your first rental property to start tracking your portfolio
							</Muted>
							<Button
								size="default"
								variant="default"
								onPress={() => router.push("/(protected)/add-property")}
								className="flex-row items-center gap-2"
							>
								<Plus size={16} className="text-primary-foreground" />
								<Text>Add Your First Property</Text>
							</Button>
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
}