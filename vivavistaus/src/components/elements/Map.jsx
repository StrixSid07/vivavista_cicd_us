import { useEffect } from 'react';

const Map = ({ latitude, longitude, title, mapId }) => {
  useEffect(() => {
    const initMap = async () => {
      const { Map } = await google.maps.importLibrary('maps');
      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

      const map = new Map(document.getElementById('map'), {
        center: { lat: latitude, lng: longitude },
        zoom: 13,
        mapId: mapId || '4504f8b37365c3d0',
      });

      const marker = new AdvancedMarkerElement({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: title,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div>${title}</div>`,
      });

      marker.addListener('click', () => {
        window.open(`https://www.google.com/maps/place/${title}/@${latitude},${longitude}`, '_blank');
      });

      marker.addListener('mouseover', () => {
        infoWindow.open(map, marker);
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });
    };

    initMap();
  }, [latitude, longitude, title, mapId]);

  return (
    <div id="map" className="h-[474px] rounded-md overflow-hidden shadow-lg transition duration-700 ease-in-out hover:shadow-2xl"></div>
  );
};

export default Map;
