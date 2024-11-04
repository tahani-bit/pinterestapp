// Import necessary React and component modules
import React from 'react';
import RandomPin from './RandomPin.js';
import Pin from './Pin.js';
import Modal from './Modal.js';
import OpenPin from './OpenPin.js';
import Header from './Header';
import { Guidelines, FinalBoardSteps } from './Guidelines.js';
import LoadingIcon from './LoadingIcon';
import ReactJoyride from 'react-joyride';
import { deletePinBackend, fetchPinsBackend } from '../firebase_setup/DatabaseOperations.js';
import { Tooltip } from 'antd';

import '../styles/final_board_styles.css'; // Import custom styles

import autoAnimate from '@formkit/auto-animate'; // Library for automatic animations

// Main FinalBoard class component to display and manage pins
class FinalBoard extends React.Component {
  constructor(props) {
    super(props);
    this.animate = React.createRef(); // Reference for animated elements

    // Initialize component state
    this.state = {
      pinsFromDb: [], // Holds pins fetched from Firestore
      pinsToShow: [], // Holds pins to display in the UI
      show_modal: false, // Controls add-pin modal visibility
      show_open_pin: false, // Controls open-pin modal visibility
      show_guidelines: false, // Controls guidelines modal visibility
      show_loading: false, // Controls loading icon visibility
    };
  }

  // Fetch pins on component mount and initialize animations
  componentDidMount() {
    this.fetchPins(); // Fetch pins from Firestore
    this.animate.current && autoAnimate(this.animate.current); // Enable animations if element is available
  }

  // Async function to fetch pins from backend
  fetchPins = async () => {
    let pinsArray = []; // Temporary array for holding pins
    let fetchedPins = await fetchPinsBackend().catch((error) => console.error(error)); // Fetch pins and catch errors
    fetchedPins.forEach((p) => {
      // Map each fetched pin to a Pin component
      pinsArray.push(<Pin pinDetails={p} key={p.id} openPin={this.openPin} deletePin={this.deletePin} />);
    });
    this.setState((_state) => {
      // Update state with fetched pins
      return {
        ..._state,
        pinsFromDb: pinsArray,
        pinsToShow: pinsArray,
      };
    });
  };

  // Refresh pin list and close modals if open
  refreshPins = async () => {
    this.setState({ show_modal: false }); // Hide add-pin modal
    await this.fetchPins(); // Fetch updated pin list
  };

  // Open pin details modal
  openPin = (pinDetails) => {
    this.pinDetails = pinDetails; // Store pin details for display
    this.setState({ show_open_pin: true }); // Show open-pin modal
  };

  // Delete a pin and refresh pins list
  deletePin = async (pinDetails) => {
    //todo: Add loading indicator or transition effect (e.g., blur/fade)
    await deletePinBackend(pinDetails); // Delete pin from backend
    await this.fetchPins(); // Refresh pin list after deletion
    this.setState({ show_open_pin: false }); // Hide open-pin modal
  };

  // Generate and display a random pin
  generateRandomPin = async (event) => {
    this.setState({ show_loading: true }); // Show loading icon
    await RandomPin(event); // Generate random pin
    await this.fetchPins(); // Fetch updated pin list
    this.setState({ show_loading: false }); // Hide loading icon
  };

  // Filter pins based on search or criteria
  filterPins = (filteredPins) => {
    this.setState({ pinsToShow: filteredPins }); // Update displayed pins
  };

  // Render method to display component UI
  render() {
    return (
      <div style={{ overflow: 'hidden' }} ref={this.windowRef}>
        {/* Header component with search/filter functionality */}
        <div class='header_container' id='header_bar'>
          <Header pinsToFilter={this.state.pinsFromDb} filterPins={this.filterPins} />
        </div>

        {/* Navigation bar with tooltips and icon buttons */}
        <div className='navigation_bar' id='navigation_bar'>
          <Tooltip title='Add new Pin'>
            <div onClick={() => this.setState({ show_modal: true })} className='pint_mock_icon_container' id='add_pin'>
              <img src='./images/add.png' alt='add_pin' className='pint_mock_icon' />
            </div>
          </Tooltip>
          <Tooltip title='Generate random Pin'>
            <div onClick={(event) => this.generateRandomPin(event)} className='pint_mock_icon_container add_pin'>
              <img src='./images/shuffle.png' alt='random' className='pint_mock_icon' />
            </div>
          </Tooltip>
          <Tooltip title='Refresh Pins'>
            <div onClick={() => this.refreshPins()} className='pint_mock_icon_container add_pin'>
              <img src='./images/refresh.png' alt='refresh' className='pint_mock_icon' />
            </div>
          </Tooltip>
          <Tooltip title='Show guidelines'>
            <div onClick={() => this.setState({ show_guidelines: true })} className='pint_mock_icon_container add_pin'>
              <img src='./images/help.png' alt='help' className='pint_mock_icon' />
            </div>
          </Tooltip>
        </div>

        {/* Container for displaying pins with animations */}
        <div className='pin_container' ref={this.animate} id='pin_container'>
          {this.state.pinsToShow} {/* Display pins */}
        </div>

        {/* Add-pin modal container */}
        <div onClick={(event) => (event.target.className === 'add_pin_modal' ? this.setState({ show_modal: false }) : null)} className='add_pin_modal_container'>
          {this.state.show_modal ? <Modal refreshPins={this.refreshPins} /> : null}
        </div>

        {/* Open-pin modal container */}
        <div onClick={(event) => (event.target.className === 'open_pin_modal' ? this.setState({ show_open_pin: false }) : null)} className='open_pin_modal_container'>
          {this.state.show_open_pin ? <OpenPin pinDetails={this.pinDetails} deletePin={this.deletePin} /> : null}
        </div>

        {/* Guidelines modal container */}
        <div onClick={(event) => (event.target.className === 'guidelines_modal' ? this.setState({ show_guidelines: false }) : null)} className='guidelines_modal_container'>
          {this.state.show_guidelines ? <Guidelines /> : null}
        </div>

        {/* Loading icon display */}
        {this.state.show_loading ? <LoadingIcon /> : null}

        {/* User tour guide for app features using ReactJoyride */}
        <ReactJoyride
          continuous
          hideCloseButton
          scrollToFirstStep
          disableScrolling={true}
          showProgress
          showSkipButton
          steps={FinalBoardSteps} // Steps for Joyride guide
          styles={{
            options: {
              primaryColor: '#ff0400',
              textColor: '#004a14',
              zIndex: 1000, // Ensures guide is above all elements
            },
          }}
        />
      </div>
    );
  }
}

export default FinalBoard; // Export component for use in other files
