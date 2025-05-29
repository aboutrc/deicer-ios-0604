import { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react-native';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface RightsSection {
  title: string;
  content: string;
}

export default function RightsScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  const rightsSections: RightsSection[] = [
    {
      title: t('rightToRefuse'),
      content: t('rightToRefuseContent'),
    },
    {
      title: t('rightToRecord'),
      content: t('rightToRecordContent'),
    },
    {
      title: t('rightToRemainSilent'),
      content: t('rightToRemainSilentContent'),
    },
    {
      title: t('rightToLegalRepresentation'),
      content: t('rightToLegalRepresentationContent'),
    },
    {
      title: t('immigrationRights'),
      content: t('immigrationRightsContent'),
    },
  ];

  const resources = [
    {
      title: t('acluKnowYourRights'),
      url: 'https://www.aclu.org/know-your-rights',
    },
    {
      title: t('immigrantDefenseProject'),
      url: 'https://www.immigrantdefenseproject.org/ice-home-and-community-arrests/',
    },
    {
      title: t('nationalImmigrationLawCenter'),
      url: 'https://www.nilc.org/issues/immigration-enforcement/everyone-has-certain-basic-rights/',
    },
  ];

  const toggleSection = (index: number) => {
    setExpandedSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const isExpanded = (index: number) => expandedSections.includes(index);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('knowYourRights')}</Text>
        <LanguageSwitcher />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.introduction}>{t('rightsIntroduction')}</Text>
        
        <View style={styles.sectionsContainer}>
          {rightsSections.map((section, index) => (
            <View key={index} style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection(index)}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {isExpanded(index) ? (
                  <ChevronUp size={20} color="#007AFF" />
                ) : (
                  <ChevronDown size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
              
              {isExpanded(index) && (
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionText}>{section.content}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.resourcesContainer}>
          <Text style={styles.resourcesTitle}>{t('additionalResources')}</Text>
          
          {resources.map((resource, index) => (
            <TouchableOpacity key={index} style={styles.resourceItem}>
              <Text style={styles.resourceText}>{resource.title}</Text>
              <ExternalLink size={16} color="#007AFF" />
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>{t('legalDisclaimer')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  introduction: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#3A3A3C',
    marginBottom: 24,
  },
  sectionsContainer: {
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#FFF',
  },
  sectionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#3A3A3C',
  },
  resourcesContainer: {
    marginBottom: 24,
  },
  resourcesTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resourceText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#007AFF',
    flex: 1,
  },
  disclaimerContainer: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  disclaimerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
  },
});