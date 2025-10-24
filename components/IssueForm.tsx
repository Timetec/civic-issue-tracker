import React, { useState, useRef } from 'react';
import { CameraIcon, LocationMarkerIcon, Spinner } from './Icons';

interface IssueFormProps {
  onSubmit: (description: string, photo: File, location: { lat: number; lng: number }) => void;
  isSubmitting: boolean;
}

export const IssueForm: React.FC<IssueFormProps> = ({ onSubmit, isSubmitting }) => {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description && photo && location) {
      onSubmit(description, photo, location);
    } else {
      alert('Please fill out all fields, upload a photo, and provide your location.');
    }
  };

  return (
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
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo</label>
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-1 text-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded-md" />
              ) : (
                <>
                  <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">Upload a file</span> or click here
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handlePhotoChange}
              required
            />
          </div>
        </div>

        <div>
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
            {location ? `Location Acquired (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Get Current Location'}
          </button>
          {locationError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{locationError}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !description || !photo || !location}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
        >
          {isSubmitting && <Spinner className="h-5 w-5 mr-3" />}
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};
