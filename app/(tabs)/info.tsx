import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Dimensions,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { WebView } from 'react-native-webview';
import { fetchInfoCards, InfoCard } from '@/services/infoService';

export default function InfoScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<InfoCard[]>([]);
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCards = async () => {
    try {
      console.log('Loading info cards...');
      const data = await fetchInfoCards();
      console.log('Loaded cards:', data);
      setCards(data);
      setError(null);
    } catch (err) {
      console.error('Error loading info cards:', err);
      setError('Failed to load content. Please try again.');
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('Refreshing cards...');
      await loadCards();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const renderVideoEmbed = (videoUrl: string) => {
    // Extract video ID from YouTube URL
    const videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
    
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const width = Dimensions.get('window').width - 32; // Full width minus padding
    const height = width * (9/16); // 16:9 aspect ratio

    return (
      <View style={[styles.videoContainer, { height }]}>
        <WebView
          source={{ uri: embedUrl }}
          style={styles.video}
          allowsFullscreenVideo
          javaScriptEnabled
        />
      </View>
    );
  };

  const renderCard = (card: InfoCard) => {
    const isExpanded = expandedCards.includes(card.id);

    // Process content to handle HTML while preserving formatting
    const processContent = (content: string) => {
      return content
        .replace(/<p>/g, '\n')
        .replace(/<\/p>/g, '')
        .replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
        .replace(/<[^>]+>/g, '')
        .trim();
    };

    return (
      <View key={card.id} style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleCard(card.id)}
        >
          <Text style={styles.cardTitle}>{card.title}</Text>
          {isExpanded ? (
            <ChevronUp size={24} color="#007AFF" />
          ) : (
            <ChevronDown size={24} color="#007AFF" />
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.cardContent}>
            {card.video_url && renderVideoEmbed(card.video_url)}
            
            <Markdown
              style={{
                body: styles.markdownBody,
                paragraph: styles.paragraph,
                link: styles.link,
                heading1: styles.heading1,
                heading2: styles.heading2,
                heading3: styles.heading3,
                bullet_list: styles.bulletList,
                ordered_list: styles.orderedList,
                list_item: styles.listItem
              }}
              onLinkPress={(url) => {
                handleLinkPress(url);
                return false;
              }}
            >
              {processContent(card.content)}
            </Markdown>

            {card.image_url && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: card.image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: 40 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
        />
      }
    >
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCards}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Information Center</Text>
          </View>
          <Text style={styles.subtitle}>
            Stay informed with the latest updates and resources
          </Text>

          <View style={styles.cardsContainer}>
            {cards.map(renderCard)}
          </View>

          {cards.length === 0 && !error && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No information cards available</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  manageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1C1C1E',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  markdownBody: {
    color: '#FFFFFF',
  },
  paragraph: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 12,
    color: '#E0E0E0',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  heading1: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 20,
    marginTop: 24,
    color: '#FFFFFF',
  },
  heading2: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    marginTop: 20,
    color: '#FFFFFF',
  },
  heading3: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    marginTop: 16,
    color: '#FFFFFF',
  },
  bulletList: {
    marginBottom: 16,
    color: '#E0E0E0',
  },
  orderedList: {
    marginBottom: 16,
    color: '#E0E0E0',
  },
  listItem: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    color: '#E0E0E0',
    marginBottom: 8,
  },
  videoContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  video: {
    flex: 1,
  },
  imageContainer: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A1C1C',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
});