import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { photosStore } from "../stores/photos";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
  useNavigate,
} from "react-router-dom";

const Gallery = observer(() => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumImageSources, setAlbumImageSources] = useState({});

  const { albumId, photoId } = useParams();
  const navigate = useNavigate();

  const fetchAlbums = async () => {
    try {
      const response = await fetch("http://localhost:3000/items/album");
      const albumData = await response.json();
      setAlbums(albumData.data);
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  const fetchPhotos = async (albumId) => {
    try {
      const response = await fetch("http://localhost:3000/items/album_files");
      const photoArray = await response.json();
      const photoNames = photoArray.data.filter(
        (item) => item.album_id === albumId
      );
      photosStore.setPhotos(photoNames.map((item) => item.directus_files_id));
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const fetchAlbumSource = async (albumID) => {
    try {
      const albumResponse = await fetch(
        `http://localhost:3000/items/album_files/${albumID}`
      );

      const albumData = await albumResponse.json();
      const firstPhotoName = albumData.data.directus_files_id;
      setAlbumImageSources((prevState) => ({
        ...prevState,
        [albumID]: `http://localhost:3000/assets/${firstPhotoName}`,
      }));
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    albums.forEach((item) => {
      fetchAlbumSource(item.id);
    });
  }, [albums]);

  useEffect(() => {
    if (albumId) {
      setSelectedAlbum(parseInt(albumId));
      fetchPhotos(parseInt(albumId));
    }
  }, [albumId]);

  useEffect(() => {
    if (photoId) {
      setSelectedPhoto(photoId);
      setIsPopupOpen(true);
    }
  }, [photoId]);

  const handleImageClick = (photo) => {
    setSelectedPhoto(photo);
    setIsPopupOpen(true);
    navigate(`/album/${selectedAlbum}/photo/${photo}`);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedPhoto(null);
    navigate(`/album/${selectedAlbum}`);
  };

  const selectNext = () => {
    const currentIndex = photosStore.photos.indexOf(selectedPhoto);
    const nextIndex = (currentIndex + 1) % photosStore.photos.length;
    const nextPhoto = photosStore.photos[nextIndex];
    setSelectedPhoto(nextPhoto);
    navigate(`/album/${selectedAlbum}/photo/${nextPhoto}`);
  };

  const selectPrevious = () => {
    const currentIndex = photosStore.photos.indexOf(selectedPhoto);
    const previousIndex =
      (currentIndex - 1 + photosStore.photos.length) %
      photosStore.photos.length;
    const prevPhoto = photosStore.photos[previousIndex];
    setSelectedPhoto(prevPhoto);
    navigate(`/album/${selectedAlbum}/photo/${prevPhoto}`);
  };

  return (
    <div className="gallery-container">
      <div className="album">
        {!selectedAlbum &&
          albums.map((album) => (
            <div key={album.id}>
              <figure className="gallery__item">
                <img
                  src={albumImageSources[album.id]}
                  className="gallery__image"
                  alt={`album-${album.id}`}
                  onClick={() => navigate(`/album/${album.id}`)}
                />
              </figure>
              <div className="blue">Школа актива, портреты</div>
              <div className="green">{album.album.length} фото</div>
            </div>
          ))}
      </div>
      {selectedAlbum && (
        <div className="gallery">
          {photosStore.photos.map((photo, index) => (
            <figure key={index} className="gallery__item">
              <img
                className="gallery__image"
                src={`http://localhost:3000/assets/${photo}`}
                alt={photo}
                onClick={() => handleImageClick(photo)}
              />
            </figure>
          ))}
          {isPopupOpen && (
            <div className="popup" onClick={closePopup}>
              <div
                className="popup__content"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  className="popup__image"
                  src={`http://localhost:3000/assets/${selectedPhoto}`}
                  alt={selectedPhoto}
                />
                <div className="container">
                  <span>
                    {photosStore.photos.indexOf(selectedPhoto) + 1}/
                    {photosStore.photos.length}
                  </span>
                  <button className="styledButton" onClick={selectPrevious}>
                    &larr;
                  </button>
                  <button className="styledButton" onClick={selectNext}>
                    &rarr;
                  </button>
                  <button className="styledButton" onClick={closePopup}>
                    &times;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Gallery />} />
      <Route path="/album/:albumId" element={<Gallery />} />
      <Route path="/album/:albumId/photo/:photoId" element={<Gallery />} />
    </Routes>
  </Router>
);

export default App;
