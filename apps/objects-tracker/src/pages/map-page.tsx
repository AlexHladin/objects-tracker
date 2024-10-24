import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import {
  Box,
  Typography,
  Paper,
  Snackbar,
  IconButton,
  Button,
  Grid2,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { observer } from 'mobx-react-lite';
import {
  EUROPE_CENTER,
  MapObject,
  MapObjectStatus,
  Vector,
} from '@objects-tracker/types';
import { INITIAL_ZOOM } from '../contants/map-constants';
import { authStore } from '../stores/auth-store';
import { useNavigate } from 'react-router-dom';
import TrackingPanel from '../components/tracking-panel';
import { mapObjectsStore } from '../stores/map-objects-store';
import { getVectorAngle } from '../utils/math';

const createArrowIcon = (directionVector: Vector, color: string) => {
  const direction = getVectorAngle(directionVector);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="14" fill="${color}" />
      <path d="M16 4 L16 28 M16 4 L8 12 M16 4 L24 12" stroke="white" stroke-width="2" fill="none" 
        transform="rotate(${direction}, 16, 16)" />
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'arrow-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const MapPage: React.FC = observer(() => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isConnectionLost, setConnectionLost] = useState<boolean>(false);
  const mapRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const trackingPanelParent = useRef<HTMLDivElement>(null);

  const [trackingPanelHeigh, setTrackingPanelHeight] = useState<number>(0);

  const handleCloseSnackbar = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const showInfoMessage = useCallback(
    (message: string) => {
      setSnackbarMessage(message);
      setOpenSnackbar(true);
    },
    [setOpenSnackbar, setSnackbarMessage]
  );

  mapObjectsStore.onRemoveObject = useCallback(
    (id: number) => {
      showInfoMessage(`Object with ID ${id} was removed`);
    },
    [showInfoMessage]
  );

  useEffect(() => {
    const loadMapObjects = async () => {
      await mapObjectsStore.initializeObjects();
      mapObjectsStore.subscribeToEvents({
        onError: (message) => {
          showInfoMessage(message);
          setConnectionLost(true);
        },
        onOpenConnection: (message) => {
          if (isConnectionLost) {
            setConnectionLost(false);
            mapObjectsStore.initializeObjects();
          }
          showInfoMessage(message);
        },
      });
    };

    loadMapObjects();

    if (trackingPanelParent.current) {
      setTrackingPanelHeight(trackingPanelParent.current.offsetHeight - 64);
    }

    return () => {
      mapObjectsStore.closeSSEConnection();
    };
  }, []);

  const MapController: React.FC = () => {
    const map = useMap();
    mapRef.current = map;
    return null;
  };

  const handleLogout = () => {
    authStore.logout();
    mapObjectsStore.closeSSEConnection();
    navigate('/');
  };

  return (
    <Grid2 container style={{ height: '100vh', overflow: 'hidden' }}>
      <Grid2 size={9}>
        <Box height="100%" width="100%">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
          >
            <Typography variant="h4">Objects tracker</Typography>

            <Button onClick={handleLogout}>Logout</Button>
          </Box>

          <MapContainer
            center={[EUROPE_CENTER.LAT, EUROPE_CENTER.LNG]}
            zoom={INITIAL_ZOOM}
            style={{ height: 'calc(100vh - 64px)', width: '100%' }}
          >
            <MapController />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {mapObjectsStore.objects.map((obj: MapObject) => (
              <Marker
                key={obj.id}
                position={[obj.position.lat, obj.position.lng]}
                icon={createArrowIcon(
                  obj.direction,
                  obj.status === MapObjectStatus.LOST ? 'red' : 'green'
                )}
              >
                <Popup>
                  ID: {obj.id}
                  <br />
                  Position: {obj.position.lat.toFixed(2)},{' '}
                  {obj.position.lng.toFixed(2)}
                  <br />
                  Direction: {obj.direction.x.toFixed(2)},{' '}
                  {obj.direction.y.toFixed(2)}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      </Grid2>

      <Grid2 size={3}>
        <Paper
          style={{ height: '100%', padding: '16px' }}
          ref={trackingPanelParent}
        >
          <TrackingPanel
            height={trackingPanelHeigh}
            itemData={mapObjectsStore.objects}
          />
        </Paper>
      </Grid2>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Grid2>
  );
});

export default MapPage;
