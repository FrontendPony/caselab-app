import { makeAutoObservable } from "mobx";

class PhotosStore {
  photos = [];

  constructor() {
    makeAutoObservable(this);
  }

  setPhotos = (photos) => {
    this.photos = photos;
  };

  addPhoto = (photo) => {
    this.photos.push(photo);
  };
}

export const photosStore = new PhotosStore();
