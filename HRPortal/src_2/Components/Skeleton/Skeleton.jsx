import React from 'react';
import PropTypes from 'prop-types'; 
const Skeleton = (props) => (
   <img 
        className="w-full rounded-lg" 
        src={props.img} 
        alt={props.alt || "Placeholder"} 
    />
);

// Prop validation
Skeleton.propTypes = {
    img: PropTypes.string.isRequired, 
    alt: PropTypes.string,
};

// Default props
Skeleton.defaultProps = {
    alt: "Loading image",
};

export default Skeleton;
