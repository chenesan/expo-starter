import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { YStack, XStack, Card, Text, Button, Sheet, ScrollView, Image } from 'tamagui';
import { MapPin, Star, Phone, Clock } from 'lucide-react-native';
import { restaurants } from '@/data/restaurants';
import { Restaurant } from '@/types/restaurant';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        // For web, use a default location (Taipei)
        setLocation({
          coords: {
            latitude: 25.0330,
            longitude: 121.5654,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('權限被拒絕', '需要位置權限才能顯示您的位置');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleMarkerPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setSheetOpen(true);
  };

  const renderPriceRange = (priceRange: string) => {
    return priceRange;
  };

  const renderRating = (rating: number) => {
    return (
      <XStack alignItems="center" gap="$1">
        <Star size={16} color="#FFD700" fill="#FFD700" />
        <Text fontSize="$3" color="$gray11">{rating}</Text>
      </XStack>
    );
  };

  if (!location) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text>載入地圖中...</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={Platform.OS !== 'web'}
        showsMyLocationButton={Platform.OS !== 'web'}
      >
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }}
            title={restaurant.name}
            description={restaurant.cuisine}
            onPress={() => handleMarkerPress(restaurant)}
          />
        ))}
      </MapView>

      <Sheet
        modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[85]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" backgroundColor="$background">
          {selectedRestaurant && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$4">
                <Image
                  source={{ uri: selectedRestaurant.image }}
                  width="100%"
                  height={200}
                  borderRadius="$4"
                />
                
                <YStack gap="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$6" fontWeight="bold">
                      {selectedRestaurant.name}
                    </Text>
                    {renderRating(selectedRestaurant.rating)}
                  </XStack>
                  
                  <XStack gap="$2" alignItems="center">
                    <Text fontSize="$4" color="$blue10">
                      {selectedRestaurant.cuisine}
                    </Text>
                    <Text fontSize="$4" color="$gray11">
                      • {renderPriceRange(selectedRestaurant.priceRange)}
                    </Text>
                  </XStack>
                </YStack>

                <Text fontSize="$4" color="$gray12" lineHeight="$5">
                  {selectedRestaurant.description}
                </Text>

                <YStack gap="$3">
                  <XStack alignItems="center" gap="$2">
                    <MapPin size={16} color="$gray11" />
                    <Text fontSize="$3" color="$gray11" flex={1}>
                      {selectedRestaurant.address}
                    </Text>
                  </XStack>

                  {selectedRestaurant.phone && (
                    <XStack alignItems="center" gap="$2">
                      <Phone size={16} color="$gray11" />
                      <Text fontSize="$3" color="$gray11">
                        {selectedRestaurant.phone}
                      </Text>
                    </XStack>
                  )}

                  <XStack alignItems="center" gap="$2">
                    <Clock size={16} color="$gray11" />
                    <Text fontSize="$3" color="$gray11">
                      {selectedRestaurant.openHours}
                    </Text>
                  </XStack>
                </YStack>

                <YStack gap="$2">
                  <Text fontSize="$4" fontWeight="600">特色</Text>
                  <XStack gap="$2" flexWrap="wrap">
                    {selectedRestaurant.features.map((feature, index) => (
                      <Button
                        key={index}
                        size="$2"
                        variant="outlined"
                        disabled
                        backgroundColor="$blue2"
                        borderColor="$blue6"
                      >
                        <Text fontSize="$2" color="$blue11">{feature}</Text>
                      </Button>
                    ))}
                  </XStack>
                </YStack>
              </YStack>
            </ScrollView>
          )}
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});