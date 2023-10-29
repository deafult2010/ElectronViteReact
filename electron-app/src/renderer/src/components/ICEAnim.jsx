import React, { useState, useEffect } from "react";
import Logo from '../assets/ICEAnim.svg'
// import Logo from '../assets/Box.svg'


const Modal = () => {
    const [isOpen, setIsOpen] = useState(true);

    // Close the modal after three seconds
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsOpen(false);
        }, 3000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            {isOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <object style={{ width: '100%', height: '100%' }} type="image/svg+xml" data={Logo}>svg-animation</object>
                    </div>
                </div>
            )
            }
        </>
    );
};

export default Modal;