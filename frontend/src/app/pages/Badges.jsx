import React from "react";
import Gold from './Assets/badge-Gold.png';
import Silver from './Assets/badge-Silver.png';
import Bronze from './Assets/badge-Bronze.png';
import Horseshoe from './Assets/badge-Horseshoe.png';
import Seven from './Assets/badge-Seven.png';
import Platinum from './Assets/badge-Platinum.png';
import Leaf from './Assets/badge-Leaf.png';
import Diamond from './Assets/badge-Diamond.png';
import "./styles/bootstrap-legacy.scoped.css";
import './styles/badges.css';
import LocalPolice from "@mui/icons-material/LocalPolice";
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';


const Badges = () => {
    return (
        <div className="legacy-page">
            <div className="badges">
                <h1 className="text-center pt-4 fw-bold">Badges<LocalPolice /></h1>
                <h2 className="px-3">Unlocked<LockOpenOutlinedIcon /></h2>
                <div className="unlocked d-flex g-5 px-5">
                    <div className="badge">
                        <img src={Seven} alt='Seven' />
                        <p className="badge-name badge-seventh">Streaky</p>
                    </div>

                    <div className="badge">
                        <img src={Bronze} alt='Bronze' />
                        <p className="badge-name badge-bronze">Bronze</p>
                    </div>

                    <div className="badge">
                        <img src={Silver} alt='Silver' />
                        <p className="badge-name badge-silver">Silver</p>
                    </div>

                    <div className="badge">
                        <img src={Leaf} alt='Leaf' />
                        <p className="badge-name badge-leaf">Language Sage</p>
                    </div>
                </div>

                <h2 className="px-3 mt-5">Locked<LockOutlinedIcon /></h2>
                <div className="locked d-flex g-5 px-5">
                    <div className="badge">
                        <img src={Horseshoe} alt='Horseshoe' />
                        <p className="badge-name badge-horseshoe">Workhorse</p>
                    </div>
                    <div className="badge">
                        <img src={Gold} alt='Gold' />
                        <p className="badge-name badge-gold">Gold</p>
                    </div>

                    <div className="badge">
                        <img src={Platinum} alt='Platinum' />
                        <p className="badge-name badge-platinum">Platinum</p>
                    </div>

                    <div className="badge">
                        <img src={Diamond} alt='Diamond' />
                        <p className="badge-name badge-diamond">Diamond</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Badges;
