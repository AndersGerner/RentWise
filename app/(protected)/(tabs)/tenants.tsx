import { View, ScrollView, RefreshControl, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Users, Plus, Phone, Mail, User } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/supabase-provider";
import { useQuery } from "@tanstack/react-query";
import { tenantService } from "@/services/tenants";

export default function Tenants() {
	const [refreshing, setRefreshing] = useState(false);
	const { session } = useAuth();
	
	const { data: tenants, isLoading, refetch } = useQuery({
		queryKey: ['tenants', session?.user?.id],
		queryFn: () => tenantService.fetchTenants(session?.user?.id!),
		enabled: !!session?.user?.id,
	});

	const onRefresh = async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
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
							<H1>Tenants</H1>
							<Muted>Manage your tenants</Muted>
						</View>
						<Button
							size="default"
							variant="default"
							onPress={() => router.push("/(protected)/add-tenant")}
							className="flex-row items-center gap-2"
						>
							<Plus size={16} className="text-primary-foreground" />
							<Text>Add</Text>
						</Button>
					</View>

					{isLoading ? (
						<View className="flex-1 items-center justify-center py-12">
							<Text>Loading tenants...</Text>
						</View>
					) : tenants && tenants.length > 0 ? (
						<View className="gap-4">
							{tenants.map((tenant) => (
								<Pressable
									key={tenant.tenant_id}
									onPress={() => router.push(`/(protected)/tenant/${tenant.tenant_id}`)}
									className="bg-card p-4 rounded-lg border border-border active:opacity-70"
								>
									<View className="flex-row items-start justify-between mb-3">
										<View className="flex-1">
											<Text className="font-semibold text-lg mb-1">{tenant.name}</Text>
											{tenant.contact_info?.email && (
												<View className="flex-row items-center gap-1 mb-1">
													<Mail size={14} className="text-muted-foreground" />
													<Text className="text-sm text-muted-foreground">
														{tenant.contact_info.email}
													</Text>
												</View>
											)}
											{tenant.contact_info?.phone && (
												<View className="flex-row items-center gap-1">
													<Phone size={14} className="text-muted-foreground" />
													<Text className="text-sm text-muted-foreground">
														{tenant.contact_info.phone}
													</Text>
												</View>
											)}
										</View>
										<User className="text-primary" size={24} />
									</View>

									<View className="flex-row justify-between items-center">
										<Text className="text-sm text-muted-foreground">
											Added {new Date(tenant.created_at).toLocaleDateString('da-DK')}
										</Text>
									</View>
								</Pressable>
							))}
						</View>
					) : (
						<View className="flex-1 items-center justify-center py-12">
							<Users className="text-muted-foreground mb-4" size={48} />
							<Text className="text-xl font-semibold mb-2">No Tenants Yet</Text>
							<Muted className="text-center mb-6">
								Add tenants to track rental agreements and contact information
							</Muted>
							<Button
								size="default"
								variant="default"
								onPress={() => router.push("/(protected)/add-tenant")}
								className="flex-row items-center gap-2"
							>
								<Plus size={16} className="text-primary-foreground" />
								<Text>Add Your First Tenant</Text>
							</Button>
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
}