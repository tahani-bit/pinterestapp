// Import necessary functions from Firebase Firestore and Storage SDKs
import { collection, doc, addDoc, getDoc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Import Firestore configuration
import { firestore } from '../firebase_setup/firebase.js';
import imageCompression from 'browser-image-compression'; // Library for image compression

// Function to fetch all pins from Firestore
export async function fetchPinsBackend() {
  let fetchedPins = []; // Array to hold fetched pins
  try {
    // Get all documents in the 'pins' collection
    await getDocs(collection(firestore, 'pins')).then((querySnapshot) => {
      const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      // Add each document to fetchedPins array
      newData.forEach((p) => {
        fetchedPins.push(p);
      });
    });
  } catch (error) {
    console.log(error); // Log errors if fetching fails
  }
  return fetchedPins; // Return the array of fetched pins
}

// Function to save a new pin to Firestore
export async function savePinBackend(e, users_data, imageFile) {
  let doc_snap; // Placeholder for document snapshot
  e.preventDefault(); // Prevent default form behavior
  try {
    // Add a new document to 'pins' collection with user data and empty img_url
    const docRef = await addDoc(collection(firestore, 'pins'), {
      ...users_data,
      img_url: '',
    });

    const storage = getStorage(); // Initialize Firebase storage

    // Compress the image file before uploading
    let compressedImg = await compressImage(imageFile);

    // Upload compressed image to storage with document ID as reference
    const storageRef = ref(storage, docRef.id);
    await uploadBytes(storageRef, compressedImg)
      .then((snapshot) => {
        console.log('Uploaded image for pin: ' + docRef.id);

        // Get the download URL for the uploaded image
        getDownloadURL(snapshot.ref)
          .then((url) => {
            // Update the document with image URL
            updateDoc(docRef, { img_url: url })
              .then(() => {
                console.log('Update of pin successful!');
              })
              .catch((error) => {
                console.log(error); // Log error if update fails
              });
          })
          .catch((error) => {
            console.log(error); // Log error if URL retrieval fails
          });
      })
      .catch((error) => {
        console.log(error); // Log error if upload fails
      });

    // Retrieve the saved document to confirm upload
    doc_snap = await getDoc(docRef);
    return doc_snap.data(); // Return document data
  } catch (e) {
    console.error('Error adding document: ', e); // Log errors if saving fails
  }
}

// Helper function to compress images before uploading
async function compressImage(imageFile) {
  let compressedFile;
  const options = {
    maxSizeMB: 1, // Set max size for image in MB
  };
  try {
    // Compress the image using provided options
    compressedFile = await imageCompression(imageFile, options);
  } catch (error) {
    console.log(error); // Log error if compression fails
  }
  return compressedFile; // Return compressed image file
}

// Function to delete a pin from Firestore and storage
export async function deletePinBackend(pin_details) {
  const storage = getStorage(); // Initialize Firebase storage
  const pinRef = ref(storage, pin_details.id); // Reference to the file in storage

  try {
    // Delete the document from Firestore and the file from storage
    await deleteDoc(doc(firestore, 'pins', pin_details.id)).then(
      deleteObject(pinRef)
        .then(() => {
          console.log('File deleted successfully'); // Log success message
        })
        .catch((e) => {
          console.log('Uh-oh, an error occurred!'); // Log error if deletion fails
        })
    );
  } catch (e) {
    console.error('Error deleting document: ', e); // Log errors if deletion fails
  }
}

// Placeholder function for updating an existing pin
export async function updatePinBackend(e, users_data) {
  // Placeholder for future update functionality
}
