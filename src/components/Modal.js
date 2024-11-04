import React, { useState, useEffect } from 'react'; // Importing React and necessary hooks
import LoadingIcon from './LoadingIcon'; // Importing a loading spinner component
import TagsCreator from './TagsCreator'; // Importing component to create tags
import ReactJoyride from 'react-joyride'; // Importing Joyride for user guidance
import { ModalSteps } from './Guidelines'; // Importing steps for Joyride guidance

import { savePinBackend } from '../firebase_setup/DatabaseOperations.js'; // Importing backend function to save a pin
import '../styles/modal_styles.css'; // Importing CSS for styling
let img_file; // Variable to store image file data

// Function to handle image upload, update state with image details, and show the image preview
function uploadImage(event, pinDetails, setPinDetails, setShowLabel, setShowModalPin) {
  if (event.target.files && event.target.files[0]) {
    if (/image\/*/.test(event.target.files[0].type)) { // Check if the uploaded file is an image
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // Read the image as a data URL
      reader.onload = function () {
        setPinDetails({
          ...pinDetails,
          img_url: reader.result, // Set the image URL to the result of file reading
        });
        setShowLabel(false); // Hide label prompting for an upload
        setShowModalPin(true); // Show the modal with the uploaded image
      };
      img_file = event.target.files[0]; // Store image file for later use
    }
  }
}

// Function to check and set image size dynamically within the modal
function checkSize(event) {
  const image = event.target;
  image.classList.add('pin_max_width'); // Initially set max width class
  // Adjust class based on container's size relative to the image's size
  if (image.getBoundingClientRect().width < image.parentElement.getBoundingClientRect().width || image.getBoundingClientRect().height < image.parentElement.getBoundingClientRect().height) {
    image.classList.remove('pin_max_width');
    image.classList.add('pin_max_height'); // Apply max height class if it fits better
  }
  image.style.opacity = 1; // Show the image after resizing
}

// Function to save pin data to the backend and refresh the displayed pins
async function savePin(setIsLoading, e, pinDetails, refreshPins) {
  setIsLoading(true); // Show loading icon
  const users_data = {
    ...pinDetails, // Spread existing pin details
    author: 'Patryk', // Hardcoded author name, could be dynamic
    board: 'default', // Default board assignment
    title: document.querySelector('#pin_title').value, // Fetching user input from title input field
    description: document.querySelector('#pin_description').value, // Fetching user input from description input field
    destination: document.querySelector('#pin_destination').value, // Fetching destination link
    pin_size: document.querySelector('#pin_size').value, // Fetching size of the pin from dropdown
  };

  await savePinBackend(e, users_data, img_file); // Call function to save the pin in Firebase or backend
  refreshPins(); // Refresh pins after saving
  setIsLoading(false); // Hide loading icon
}

// Modal component definition
function Modal(props) {
  // Effect to manage scroll behavior on modal open
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); // Scroll to top when modal opens
    if (window.onscrollend !== undefined) {
      document.body.style.overflow = 'hidden'; // Disable scrolling while modal is open
    }
    return () => {
      document.body.style.overflow = 'unset'; // Enable scrolling on modal close
    };
  }, []);

  // State for pin details, initial view settings, and tags
  const [pinDetails, setPinDetails] = useState({
    author: '',
    board: '',
    title: '',
    destination: '',
    description: '',
    img_url: '',
    pin_size: '',
    tags: [],
  });
  const [showLabel, setShowLabel] = useState(true); // Control label visibility for image upload
  const [showModalPin, setShowModalPin] = useState(false); // Control visibility of image preview in modal
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [tags, setTags] = useState(['Default', 'Pin']); // Initialize with default tags

  // Function to add tags by listening for Enter keypress in tag input field
  const addTag = (event) => {
    if (event.target.value !== '') {
      setTags([...tags, event.target.value]); // Append new tag to tags array
      setPinDetails({
        ...pinDetails,
        tags: tags, // Update pinDetails with new tags
      });
      event.target.value = ''; // Clear input field after adding
    }
  };

  return (
    <div className='add_pin_modal'>
      <div className='add_pin_container'>
        {/* Left side of the modal for image upload and preview */}
        <div className='side' id='left_side'>
          <div className='section1'>
            <div className='pint_mock_icon_container'>
              <img src='./images/ellipse.png' alt='edit' className='pint_mock_icon' />
            </div>
          </div>
          <div className='section2'>
            {/* Image upload area */}
            <label htmlFor='upload_img' id='upload_img_label' style={{ display: showLabel ? 'block' : 'none' }}>
              <div className='upload_img_container' id='upload_img_container'>
                <div id='dotted_border'>
                  <div className='pint_mock_icon_container'>
                    <img src='./images/up-arrow.png' alt='upload_img' className='pint_mock_icon' />
                  </div>
                  <div>Click to upload</div>
                  <div>Recommendation: Use high-quality .jpg less than 20MB</div>
                </div>
              </div>
              <input onChange={(event) => uploadImage(event, pinDetails, setPinDetails, setShowLabel, setShowModalPin)} type='file' name='upload_img' id='upload_img' value='' />
            </label>
            {/* Display uploaded image */}
            <div className='modals_pin' style={{ display: showModalPin ? 'block' : 'none' }}>
              <div className='pin_image'>
                <img onLoad={checkSize} src={pinDetails.img_url} alt='pin_image' />
              </div>
            </div>
          </div>

          <div className='section3'>
            <div className='save_from_site'>Save from site</div>
          </div>
        </div>
        
        {/* Right side for input fields and save button */}
        <div className='side' id='right_side'>
          <div className='section1'>
            <div className='select_size' id='select_size'>
              <select defaultValue='medium' name='pin_size' id='pin_size'>
                <option value='small'>Small</option>
                <option value='medium'>Medium</option>
                <option value='large'>Large</option>
              </select>
              {/* Save pin button */}
              <div onClick={(e) => savePin(setIsLoading, e, pinDetails, props.refreshPins)} className='save_pin'>
                Save
              </div>
            </div>
          </div>
          
          {/* Input fields for pin title, description, destination, and tags */}
          <div className='section2' id='pin_details'>
            <input placeholder='Add your title' type='text' className='new_pin_input' id='pin_title' />
            <input placeholder='Describe what the Pin is about' type='text' className='new_pin_input' id='pin_description' />
            <input placeholder='Add a destination link' type='text' className='new_pin_input' id='pin_destination' />
            <input placeholder='Add tags by clicking Enter' type='text' className='new_pin_input' id='pin_tags' onKeyUp={(event) => (event.key === 'Enter' ? addTag(event) : null)} />
          </div>
          
          {/* Display and manage tags */}
          <div className='section3' id='tags_container'>
            <TagsCreator tags={tags} setTags={setTags} editable={true} />
          </div>
        </div>
      </div>
      
      {/* Display loading icon if isLoading is true */}
      {isLoading ? <LoadingIcon /> : null}
      
      {/* ReactJoyride for guided user experience */}
      <ReactJoyride
        continuous
        scrollToFirstStep
        disableScrolling={true}
        showProgress
        showSkipButton
        steps={ModalSteps}
        styles={{
          options: {
            primaryColor: '#ff0400',
            textColor: '#004a14',
            zIndex: 1000,
          },
        }}
      />
    </div>
  );
}

export default Modal; // Exporting Modal component
