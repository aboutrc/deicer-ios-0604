import React, { useState, useRef, useEffect } from 'react';
import { Map as MapGL, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import { Marker, Popup } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ScanEye, Plus, AlertTriangle, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import LocationSearch from './LocationSearch';
import UniversitySelector from './UniversitySelector';
import BottomMenu from './BottomMenu';
import Modal from './Modal';
import { supabase, fetchMarkersWithinRadius, getMarkerImageUrl } from '../lib/supabase';
import { addAlert } from './AlertSystem';
import type { Marker as MarkerType, MarkerCategory } from '../types';
import { compressImage } from '../lib/imageUtils';

const MAPTILER_KEY = 'ZTF4YUjQcvphCsMPHw7K';

// ... existing code ... 