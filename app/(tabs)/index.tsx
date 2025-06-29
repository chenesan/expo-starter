import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Platform, View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { YStack, XStack, Card, Button, Sheet, ScrollView, Image } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { restaurants } from '@/data/restaurants';
import { Restaurant } from '@/types/restaurant';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        setIsLoading(true);
        setLocationError(null);

        if (Platform.OS === 'web') {
          // For web, use a default location (Taipei)
          const defaultLocation = {
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
          };
          
          if (isMounted) {
            setLocation(defaultLocation);
            setIsLoading(false);
          }
          return;
        }

        // Request permissions for mobile platforms
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          if (isMounted) {
            setLocationError('需要位置權限才能顯示您的位置');
            // Still set a default location so the map can load
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
            setIsLoading(false);
          }
          return;
        }

        // Get current position with timeout
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000, // 10 second timeout
        });

        if (isMounted) {
          setLocation(currentLocation);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Location error:', error);
        if (isMounted) {
          setLocationError('無法獲取位置，使用預設位置');
          // Set default location as fallback
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
          setIsLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
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
        <MaterialIcons name="star" size={16} color="#FFD700" />
        <Text style={{ fontSize: 14, color: '#666' }}>{rating}</Text>
      </XStack>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <MaterialIcons name="location-searching" size={48} color="#666" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>載入地圖中...</Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: '#999', textAlign: 'center' }}>
          正在獲取您的位置
        </Text>
      </YStack>
    );
  }

  // Show error state if location is still null
  if (!location) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background" padding="$4">
        <MaterialIcons name="location-off" size={48} color="#ff6b6b" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center' }}>
          無法載入地圖
        </Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: '#999', textAlign: 'center' }}>
          {locationError || '位置服務不可用'}
        </Text>
        <Button
          marginTop="$4"
          onPress={() => {
            setIsLoading(true);
            // Retry location
            setTimeout(() => {
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
              setIsLoading(false);
              setLocationError(null);
            }, 1000);
          }}
        >
          重試
        </Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      {/* Location error banner */}
      {locationError && (
        <View style={styles.errorBanner}>
          <MaterialIcons name="warning" size={16} color="#ff9800" />
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}

      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={Platform.OS !== 'web' && !locationError}
        showsMyLocationButton={Platform.OS !== 'web' && !locationError}
        loadingEnabled={true}
        loadingIndicatorColor="#666"
        loadingBackgroundColor="#f5f5f5"
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
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                      {selectedRestaurant.name}
                    </Text>
                    {renderRating(selectedRestaurant.rating)}
                  </XStack>
                  
                  <XStack gap="$2" alignItems="center">
                    <Text style={{ fontSize: 16, color: '#2196F3' }}>
                      {selectedRestaurant.cuisine}
                    </Text>
                    <Text style={{ fontSize: 16, color: '#666' }}>
                      • {renderPriceRange(selectedRestaurant.priceRange)}
                    </Text>
                  </XStack>
                </YStack>

                <Text style={{ fontSize: 16, color: '#333', lineHeight: 24 }}>
                  {selectedRestaurant.description}
                </Text>

                <YStack gap="$3">
                  <XStack alignItems="center" gap="$2">
                    <MaterialIcons name="location-on" size={16} color="#666" />
                    <Text style={{ fontSize: 14, color: '#666', flex: 1 }}>
                      {selectedRestaurant.address}
                    </Text>
                  </XStack>

                  {selectedRestaurant.phone && (
                    <XStack alignItems="center" gap="$2">
                      <MaterialIcons name="phone" size={16} color="#666" />
                      <Text style={{ fontSize: 14, color: '#666' }}>
                        {selectedRestaurant.phone}
                      </Text>
                    </XStack>
                  )}

                  <XStack alignItems="center" gap="$2">
                    <MaterialIcons name="access-time" size={16} color="#666" />
                    <Text style={{ fontSize: 14, color: '#666' }}>
                      {selectedRestaurant.openHours}
                    </Text>
                  </XStack>
                </YStack>

                <YStack gap="$2">
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>特色</Text>
                  <XStack gap="$2" flexWrap="wrap">
                    {selectedRestaurant.features.map((feature, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: '#e3f2fd',
                          borderColor: '#2196F3',
                          borderWidth: 1,
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#1976D2' }}>{feature}</Text>
                      </View>
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
  errorBanner: {
    backgroundColor: '#fff3cd',
    borderBottomColor: '#ffeaa7',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
  },
});