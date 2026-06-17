import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ── Color Palette (per spec sheet) ──────────────────────────────
const COLORS = {
  deepCrimson: '#4A0E17',
  darkBurgundy: '#2A080C',
  gold: '#D4AF37',
  white: '#FFFFFF',
  gray: '#A3A3A3',
  translucentWhite: 'rgba(255,255,255,0.07)',
  softWhiteBorder: 'rgba(255,255,255,0.12)',
  translucentBlack: 'rgba(0,0,0,0.2)',
};

// ── Location (Nasugbu, Batangas, PH) ────────────────────────────
const LOCATION_NAME = 'Nasugbu Batangas, PH';
const LOCATION_LAT = 14.07; // 14°04'12" N
const LOCATION_LON = 120.63; // 120°37'48" E

type WeatherData = {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
};

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function HomeScreen() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Live clock — ticks every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Live weather fetch (Open-Meteo — no API key required)
  useEffect(() => {
    let isMounted = true;

    async function fetchWeather() {
      try {
        setLoadingWeather(true);
        const apiKey = process.env.EXPO_PUBLIC_WEATHERBIT_API_KEY;
        if (!apiKey) {
          console.warn(
            'Missing EXPO_PUBLIC_WEATHERBIT_API_KEY — add it to your .env file.'
          );
          return;
        }
        const response = await fetch(
          `https://api.weatherbit.io/v2.0/current?lat=${LOCATION_LAT}&lon=${LOCATION_LON}&key=${apiKey}&units=M`
        );
        const data = await response.json();
        const current = data?.data?.[0];
        if (isMounted && current) {
          setWeather({
            temp: Math.round(current.temp),
            condition: capitalize(current.weather?.description ?? 'Unknown'),
            humidity: Math.round(current.rh),
            wind: Math.round(current.wind_spd * 3.6), // m/s → km/h
          });
        }
      } catch (error) {
        console.warn('Failed to fetch weather:', error);
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    }

    fetchWeather();
    
    
    const refreshInterval = setInterval(fetchWeather, 4 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.deepCrimson, COLORS.darkBurgundy]}
        style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Location pill — pinned to the top of the screen */}
          <View style={styles.locationPill}>
            <Ionicons name="location" size={16} color={COLORS.gold} />
            <Text style={styles.locationText}>{LOCATION_NAME}</Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Current time card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="time-outline" size={16} color={COLORS.gold} />
                <Text style={styles.cardLabel}>Current Time</Text>
              </View>
              <Text style={styles.timeText}>{timeStr}</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
                <Text style={styles.dateText}>{dateStr}</Text>
              </View>
            </View>

            {/* Weather card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="partly-sunny-outline" size={16} color={COLORS.gold} />
                <Text style={styles.cardLabel}>Weather Updates</Text>
              </View>

              {loadingWeather ? (
                <ActivityIndicator
                  color={COLORS.gold}
                  style={styles.weatherLoading}
                />
              ) : weather ? (
                <>
                  <Text style={styles.tempText}>{weather.temp}°C</Text>
                  <Text style={styles.conditionText}>{weather.condition}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Humidity</Text>
                      <Text style={styles.statValue}>{weather.humidity}%</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Wind</Text>
                      <Text style={styles.statValue}>{weather.wind} km/h</Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.conditionText}>Unable to load weather</Text>
              )}
            </View>

            {/* React Native branding card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="react" size={16} color={COLORS.gold} />
                <Text style={styles.cardLabel}>React Native</Text>
              </View>
              <Text style={styles.brandText}>SIR MAGS</Text>
            </View>
          </ScrollView>

          {/* Footer — pinned to the bottom of the screen */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <MaterialCommunityIcons name="react" size={9} color={COLORS.gold} />
              <Text style={styles.footerText}>React Native · Live Monitors</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },

  locationPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.translucentWhite,
    borderWidth: 1,
    borderColor: COLORS.softWhiteBorder,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  locationText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: COLORS.translucentWhite,
    borderWidth: 1,
    borderColor: COLORS.softWhiteBorder,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  timeText: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: COLORS.gray,
    fontSize: 13,
  },

  weatherLoading: {
    marginVertical: 28,
  },
  tempText: {
    color: COLORS.white,
    fontSize: 44,
    fontWeight: '800',
  },
  conditionText: {
    color: COLORS.gray,
    fontSize: 15,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.translucentBlack,
    borderRadius: 16,
    paddingVertical: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.softWhiteBorder,
  },

  brandText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 12,
    gap: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: COLORS.gray,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});