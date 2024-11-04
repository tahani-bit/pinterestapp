import React from 'react'; // Importing React library
import '../styles/header_styles.css'; // Importing CSS styles for the header component
import { MoreOutlined } from '@ant-design/icons'; // Importing 'More' icon from Ant Design
import { Dropdown, Button, Space, Tooltip } from 'antd'; // Importing components from Ant Design

// Function to filter pins based on search input
function filterResults(event, props) {
  let filteredPins = props.pinsToFilter.filter((pin) => {
    // Converting pin tags to a lowercase string for comparison
    let tags = JSON.stringify(pin.props.pinDetails.tags);
    return tags.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1; // Returns true if input matches any tag
  });
  props.filterPins(filteredPins); // Calls the filter function to update displayed pins
}

// Header component definition
function Header(props) {
  // todo: extract Dropdown definitions to separate file
  const items = [
    {
      label: <span>Profile</span>, // Dropdown item for Profile
      key: '0',
    },
    {
      label: <span>Settings</span>, // Dropdown item for Settings
      key: '1',
    },
    {
      label: <span>Contact</span>, // Dropdown item for Contact
      key: '2',
    },
  ];

  return (
    <div className='pinterest'>
      {/* Left section with logo and homepage link */}
      <div className='left'>
        <Tooltip title='Homepage'>
          <a href='/' className='logo'>
            <img src='./images/pinterest-logo.png' alt='logo' className='logo' /> {/* Pinterest logo */}
          </a>
        </Tooltip>
      </div>

      {/* Center search bar */}
      <div className='search'>
        <img src='./images/loupe.png' alt='loupe' style={{ maxHeight: '50%', paddingLeft: '15px', paddingRight: '10px', opacity: '0.5' }} />
        <input onChange={(event) => filterResults(event, props)} type='search' placeholder='Search by keywords, f.ex. Nature' />
      </div>

      {/* Right section with dropdown and profile avatar */}
      <div className='right'>
        {/* Dropdown menu for additional options */}
        <div className='items'>
          <Dropdown menu={{ items }} trigger={['click']}>
            <Space direction='vertical'>
              <Space wrap>
                <Tooltip title='More'>
                  <Button type='default' shape='circle' icon={<MoreOutlined />} /> {/* Button with 'More' icon */}
                </Tooltip>
              </Space>
            </Space>
          </Dropdown>
        </div>

        {/* Profile avatar with tooltip */}
        <Tooltip title='Profile'>
          <a href='/' className='avatar'>
            <div className='img'>
              <img src='./images/profile.jpg' alt='' /> {/* Profile image */}
            </div>
          </a>
        </Tooltip>
      </div>
    </div>
  );
}

export default Header; // Exporting Header component for use in other files
