import React, { ReactElement, useState } from "react";
import RNLocation from "react-native-location";
import { PixelRatio, Platform, StyleSheet } from "react-native";
import { Dimensions } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import MapView, { Callout, Marker, Polyline } from "react-native-maps";
import theme from "../../../themes/theme";
import mapTheme from "../../../../assets/mapThemes/mapTheme";
import { getPolylineArray } from "../../../utils/directionsUtils";
import { State } from "../../../../rootReducer";
import { setPlaceIndex, setUserLocation } from "../redux/searchActions";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  showShadow?: boolean;
  diameter?: number;
  onIconPress?: () => void;
  onRemovePress: (index: number) => void;
  originLocations: any;
  searchResult: any;
  mapHeight: number;
}

export default function FullMapView({
  originLocations,
  searchResult,
  mapHeight,
}: Props): ReactElement {
  const dispatch = useDispatch();
  const [pressedMarker, setPressedMarker] = React.useState(-1);
  const mapRef = React.useRef<any | null>(null);

  const placeIndex = useSelector(
    (state: State) => state.searchReducer.placeIndex
  );
  const userLocation = useSelector(
    (state: State) => state.searchReducer.userLocation
  );
  const searchType = useSelector(
    (state: State) => state.searchReducer.searchType
  );

  const searchLoading = useSelector(
    (state: State) => state.searchReducer.searchLoading
  );

  const currentRouteGeometry = useSelector(
    (state: State) => state.searchReducer.currentRouteGeometry
  );
  const region = {
    latitude: userLocation?.latitude || 39.8283,
    longitude: userLocation?.longitude || -98.5795,
    latitudeDelta: 50,
    longitudeDelta: 50,
  };
  const [originMarkers, setOriginMarkers] = useState<any>([]);
  const [destinationMarkers, setDestinationMarkers] = useState<any>([]);

  React.useEffect(() => {
    let markers = originLocations.map((location) => {
      return {
        latitude: location?.position?.lat,
        longitude: location?.position?.lon,
        description: location?.poi?.name ?? location?.address?.freeformAddress,
        latitudeDelta: 5,
        longitudeDelta: 5,
        pinColor: theme.darkPurple,
      };
    });
    setOriginMarkers(markers);
  }, [originLocations]);

  React.useEffect(() => {
    let markers = searchResult.map((result) => {
      return {
        latitude: result?.coordinates?.latitude,
        longitude: result?.coordinates?.longitude,
        latitudeDelta: 5,
        longitudeDelta: 5,
        pinColor: theme.secondary,
      };
    });
    setDestinationMarkers(markers);
  }, [searchResult]);

  React.useEffect(() => {
    const getLocationPermission = async () => {
      const permission = await RNLocation.requestPermission({
        ios: "whenInUse",
        android: {
          detail: "coarse",
          rationale: {
            title: "We need to access your location",
            message: "We use your location to show where you are on the map",
            buttonPositive: "OK",
            buttonNegative: "Cancel",
          },
        },
      });
      if (permission) {
        const location = await RNLocation.getLatestLocation({ timeout: 100 });
        dispatch(setUserLocation(location));
      }
    };
    getLocationPermission();
  }, []);

  React.useEffect(() => {
    if (!!userLocation?.longitude && !!userLocation?.latitude) {
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: 1,
        longitudeDelta: 1,
      });
    }
  }, [userLocation]);

  React.useEffect(() => {
    //used if there are 1 or 0 locations set.
    const setToRegion = originMarkers.length === 1 ? originMarkers[0] : region;
    if (originLocations.length < 2) {
      mapRef.current.animateToRegion({
        ...setToRegion,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
      });
      return;
    }

    //used if there are multiple locations set
    console.log("Destination Markers: ", destinationMarkers);
    setTimeout(() => {
      mapRef.current.fitToCoordinates(
        [...destinationMarkers, ...originMarkers],
        {
          animated: true,
          edgePadding: {
            top: Platform.OS === "ios" ? 150 : PixelRatio.get() * 100 - 50,
            right: 100,
            left: 100,
            bottom: Platform.OS === "ios" ? 100 : PixelRatio.get() * 350 - 50,
          },
        }
      );
    }, 250);
    return () => {};
  }, [originMarkers, destinationMarkers, searchType, placeIndex, mapHeight]);

  let polylineArray;

  if (!!currentRouteGeometry) {
    polylineArray = getPolylineArray(currentRouteGeometry);
  }

  return (
    <MapView
      ref={mapRef}
      onPress={() => {
        setPressedMarker(-1);
      }}
      style={[
        styles.mapStyles,
        {
          height: mapHeight,
        },
      ]}
      initialRegion={region}
      provider={"google"}
      customMapStyle={mapTheme}
    >
      {originMarkers.map((marker, i) => (
        <Marker
          key={`${marker?.latitude},${marker?.latitude},${i}`}
          identifier={`id${i}`}
          coordinate={marker}
          description={marker.description}
          pinColor={marker.pinColor}
          style={{ zIndex: 5 }}
          onPress={(e) => {
            e.stopPropagation();
            setPressedMarker(i);
            dispatch(setPlaceIndex(i));
          }}
        ></Marker>
      ))}
      {destinationMarkers.map((marker, i) => {
        const markerStyle =
          placeIndex === i
            ? { zIndex: 10, height: 100, width: 100 }
            : { zIndex: 0 };
        return (
          <Marker
            key={`${marker?.latitude},${marker?.longitude},${i} ${marker.description}`}
            identifier={`id${i}`}
            coordinate={marker}
            description={marker.description}
            opacity={placeIndex === i ? 1 : 0.3}
            pinColor={placeIndex === i ? marker.pinColor : theme.lightGrey}
            style={markerStyle}
          ></Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  mapStyles: {
    position: "absolute",
    zIndex: -2,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT / 1.5,
    flex: 1,
  },
});
