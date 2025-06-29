import React, { useState } from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack, Card, Text, Input, Button, Image } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { restaurants } from '@/data/restaurants';
import { Restaurant } from '@/types/restaurant';

export default function ListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const cuisineTypes = ['全部', '台式料理', '台式小吃', '台菜', '台南料理', '夜市小吃', '牛肉麵'];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCuisine = !selectedCuisine || selectedCuisine === '全部' || restaurant.cuisine === selectedCuisine;
    
    return matchesSearch && matchesCuisine;
  });

  const renderPriceRange = (priceRange: string) => {
    return priceRange;
  };

  const renderRating = (rating: number) => {
    return (
      <XStack alignItems="center" gap="$1">
        <MaterialIcons name="star" size={14} color="#FFD700" />
        <Text fontSize="$2" color="$gray11">{rating}</Text>
      </XStack>
    );
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <Card
      elevate
      size="$4"
      bordered
      marginHorizontal="$4"
      marginVertical="$2"
      backgroundColor="$background"
    >
      <Card.Header padding="$0">
        <Image
          source={{ uri: item.image }}
          width="100%"
          height={160}
          borderTopLeftRadius="$4"
          borderTopRightRadius="$4"
        />
      </Card.Header>
      
      <YStack padding="$4" gap="$3">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} gap="$1">
            <Text fontSize="$5" fontWeight="bold" numberOfLines={1}>
              {item.name}
            </Text>
            <XStack gap="$2" alignItems="center">
              <Text fontSize="$3" color="$blue10">
                {item.cuisine}
              </Text>
              <Text fontSize="$3" color="$gray11">
                • {renderPriceRange(item.priceRange)}
              </Text>
            </XStack>
          </YStack>
          {renderRating(item.rating)}
        </XStack>

        <Text fontSize="$3" color="$gray12" numberOfLines={2} lineHeight="$4">
          {item.description}
        </Text>

        <YStack gap="$2">
          <XStack alignItems="center" gap="$2">
            <MaterialIcons name="location-on" size={14} color="#666" />
            <Text fontSize="$2" color="$gray11" flex={1} numberOfLines={1}>
              {item.address}
            </Text>
          </XStack>

          {item.phone && (
            <XStack alignItems="center" gap="$2">
              <MaterialIcons name="phone" size={14} color="#666" />
              <Text fontSize="$2" color="$gray11">
                {item.phone}
              </Text>
            </XStack>
          )}

          <XStack alignItems="center" gap="$2">
            <MaterialIcons name="access-time" size={14} color="#666" />
            <Text fontSize="$2" color="$gray11">
              {item.openHours}
            </Text>
          </XStack>
        </YStack>

        <XStack gap="$1" flexWrap="wrap">
          {item.features.slice(0, 3).map((feature, index) => (
            <Button
              key={index}
              size="$1"
              variant="outlined"
              disabled
              backgroundColor="$blue2"
              borderColor="$blue6"
              paddingHorizontal="$2"
            >
              <Text fontSize="$1" color="$blue11">{feature}</Text>
            </Button>
          ))}
          {item.features.length > 3 && (
            <Text fontSize="$1" color="$gray11" alignSelf="center">
              +{item.features.length - 3}
            </Text>
          )}
        </XStack>
      </YStack>
    </Card>
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack padding="$4" paddingTop="$6" backgroundColor="$background" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Text fontSize="$7" fontWeight="bold" marginBottom="$3">
          台灣餐廳
        </Text>
        
        {/* Search Bar */}
        <XStack gap="$2" alignItems="center" marginBottom="$3">
          <YStack flex={1} position="relative">
            <Input
              placeholder="搜尋餐廳、料理或地址..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              paddingLeft="$8"
              backgroundColor="$gray2"
              borderColor="$gray6"
            />
            <MaterialIcons 
              name="search" 
              size={16} 
              color="#666" 
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: [{ translateY: -8 }]
              }}
            />
          </YStack>
        </XStack>

        {/* Cuisine Filter */}
        <FlatList
          data={cuisineTypes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Button
              size="$3"
              marginRight="$2"
              variant={selectedCuisine === item ? "solid" : "outlined"}
              backgroundColor={selectedCuisine === item ? "$blue9" : "$background"}
              borderColor="$blue6"
              onPress={() => setSelectedCuisine(item)}
            >
              <Text 
                fontSize="$3" 
                color={selectedCuisine === item ? "white" : "$blue11"}
              >
                {item}
              </Text>
            </Button>
          )}
        />
      </YStack>

      {/* Restaurant List */}
      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurant}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <YStack padding="$8" alignItems="center">
            <Text fontSize="$4" color="$gray11" textAlign="center">
              找不到符合條件的餐廳
            </Text>
            <Text fontSize="$3" color="$gray10" textAlign="center" marginTop="$2">
              試試調整搜尋條件或篩選器
            </Text>
          </YStack>
        }
      />
    </YStack>
  );
}