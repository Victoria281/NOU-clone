// @ts-nocheck
import { Fragment, useEffect, useState } from "react";
import "./profile.css";
import UserInfoCard from './UserInfoSection/UserInfoCard'
import SecurityCard from './SecuritySection/SecurityCard'
import ProfileModal from './ProfileModal/ProfileModal'

const Profile = () => {
  const [userInfo, setUserInfo] = useState([]);

  const getUser = async () => {
    try {
      const uid = localStorage.getItem('userid')
      const response = await fetch(
        process.env.REACT_APP_API_URL + `/api/uno/user/${uid}`,  {
          method: 'GET',
          headers: {
            'authorization': localStorage.getItem('token'),
          }}
      );
      console.log(response)
      const jsonData = await response.json();
      var userInformation = jsonData.user;
      console.log("userInformation")
      console.log(userInformation)
      setUserInfo(userInformation);
    } catch (err) {
      console.error(err.message);
    }

  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <Fragment>
      <div id="root">
      <ProfileModal />
        <div className="gameProfileBody py-4">
          <div className="row no-gutters">
            <div id="accordion" className="w-100">
              {/* Profile */}
              <div className="card my-3">
                <div id="headerOne" className="card-header d-flex justify-content-between" data-toggle="collapse" href="#collapseOne">
                  <button className="collapsed card-link text-dark">
                    <i className="fa fa-address-card-o"></i>    Profile
                  </button>
                  <i className="fa fa-arrow-down p-1"></i>
                </div>
                <div id="collapseOne" className="collapse show" data-parent="#accordion">
                  <div id="bodyOne" className="card-body">
                    <UserInfoCard/>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="card my-3">
                <div id="headerTwo" className="card-header d-flex justify-content-between" data-toggle="collapse" href="#collapseTwo">
                  <button className="collapsed card-link text-dark" >
                    <i className="fa fa-lock"></i>    Change Password
                  </button>
                  <i className="fa fa-arrow-down p-1"></i>
                </div>
                <div id="collapseTwo" className="changePassword collapse" data-parent="#accordion">
                  <div id="bodyTwo" className="card-body">
                    <SecurityCard/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Profile;
