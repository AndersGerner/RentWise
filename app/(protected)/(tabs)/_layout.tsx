import React from "react";
import { Tabs } from "expo-router";
import { Home, Building, DollarSign, Users, Settings } from "lucide-react-native";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				tabBarActiveTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
				tabBarShowLabel: true,
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "500",
				},
			}}
		>
			<Tabs.Screen 
				name="index" 
				options={{ 
					title: "Dashboard",
					tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
				}} 
			/>
			<Tabs.Screen 
				name="properties" 
				options={{ 
					title: "Properties",
					tabBarIcon: ({ color, size }) => <Building color={color} size={size} />
				}} 
			/>
			<Tabs.Screen 
				name="financials" 
				options={{ 
					title: "Financials",
					tabBarIcon: ({ color, size }) => <DollarSign color={color} size={size} />
				}} 
			/>
			<Tabs.Screen 
				name="tenants" 
				options={{ 
					title: "Tenants",
					tabBarIcon: ({ color, size }) => <Users color={color} size={size} />
				}} 
			/>
			<Tabs.Screen 
				name="settings" 
				options={{ 
					title: "Settings",
					tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
				}} 
			/>
		</Tabs>
	);
}
