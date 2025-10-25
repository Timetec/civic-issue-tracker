import React, { useState, useRef } from 'react';
import { CameraIcon, LocationMarkerIcon, Spinner } from './Icons';
import { MapModal } from './MapModal';
import { StaticMapPreview } from './StaticMapPreview';

interface IssueFormProps {
  onSubmit: (description: string, photos: File[], location: { lat: number; lng: number }) => void;
  isSubmitting: boolean;
}

export const IssueForm: React.FC<IssueFormProps> = ({ onSubmit, isSubmitting }) => {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPhotos(prevPhotos => [...prevPhotos, ...filesArray]);

      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews(prevPreviews => [...prevPreviews, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      // Clear the input value to allow selecting the same file again if needed
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos(photos.filter((_, index) => index !== indexToRemove));
    setPhotoPreviews(photoPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError(`Error: ${error.message}`);
        setIsGettingLocation(false);
      }
    );
  };
  
  const handleMapLocationSelect = (newLocation: {lat: number, lng: number}) => {
    setLocation(newLocation);
    setIsMapModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description && location) {
      onSubmit(description, photos, location);
    } else {
      alert('Please fill out the description and provide your location.');
    }
  };

  return (
    <>
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Report a New Issue</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photos (Optional)</label>
            {photoPreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                 <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                 <p className="text-sm text-gray-600 dark:text-gray-400">
                   <span className="font-medium text-indigo-600 dark:text-indigo-400">Upload files</span> or click here
                 </p>
                 <p className="text-xs text-gray-500 dark:text-gray-500">Add one or more photos</p>
              </div>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {isGettingLocation ? (
                <Spinner className="h-5 w-5 mr-2" />
              ) : (
                <LocationMarkerIcon className="h-5 w-5 mr-2" />
              )}
              {location ? 'Recenter on My Location' : 'Get Current Location'}
            </button>
            {locationError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{locationError}</p>}
            {location && (
                <div className="mt-4">
                  <StaticMapPreview location={location} className="h-40 w-full rounded-md" />
                  <button type="button" onClick={() => setIsMapModalOpen(true)} className="mt-2 w-full text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      Adjust Location on Map
                  </button>
                </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !description || !location}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
          >
            {isSubmitting && <Spinner className="h-5 w-5 mr-3" />}
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
      {location && (
        <MapModal 
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          initialCenter={location}
          onConfirm={handleMapLocationSelect}
        />
      )}
    </>
  );
};
