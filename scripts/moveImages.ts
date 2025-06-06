import { moveImageToPinMarkersImages } from '../lib/supabase';

// The filename of the working image
const workingImage = 'marker-1749019123580-1eedl9d8gih.jpg';

async function moveImages() {
  console.log('Moving images from pin-markers to pin-markers-images...');
  
  const success = await moveImageToPinMarkersImages(workingImage);
  
  if (success) {
    console.log('Successfully moved image:', workingImage);
  } else {
    console.error('Failed to move image:', workingImage);
  }
}

moveImages().catch(console.error); 