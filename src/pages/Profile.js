import React, { useState, useEffect } from 'react'
import Navbar from '../compnents/Navbar'
import Container from '../compnents/Container'
import Footer from '../compnents/Footer'
import { ImRocket } from 'react-icons/im'
import { MdOutlineCloudUpload } from 'react-icons/md'
import { useSelector, useDispatch } from 'react-redux'
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getStorage, ref as iref, uploadString, getDownloadURL, uploadBytes } from "firebase/storage";
import { getAuth, onAuthStateChanged, signOut, updateProfile, } from "firebase/auth";
import { userLoginInfo } from '../slices/userSlice';
import { useNavigate } from 'react-router-dom'
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import moment from 'moment/moment';
import { BsThreeDots } from 'react-icons/bs'
import Project from '../compnents/Project'

const Profile = () => {
  const db = getDatabase();
  const auth = getAuth();
  let navigate = useNavigate()
  const storage = getStorage();
  let dispatch = useDispatch()
  let [coverList, setCoverList] = useState([])
  let [titleList, setTitleList] = useState([])
  let [postlist, setPostList] = useState([])
  let data = useSelector((state) => state.userLoginInfo.userInformation)
  let [verify, setVerify] = useState(false)
  let [modalShow, setModalshow] = useState(false)
  let [CoverImg, setCoverImg] = useState(null)
  let [coverModalShow, setCoverModalShow] = useState(false)
  let [contactShow, setContactShow] = useState(false)


  useEffect(() => {
    if (!data) {
      navigate('/login')
    }
  }, [])
  useEffect(() => {
    if (data.emailVerified) {
      setVerify(true)
    }
  }, [])

  onAuthStateChanged(auth, (user) => {
    // if(user.emailVerified){
    //   setVerify(true)
    // }
    dispatch(userLoginInfo(user))
    localStorage.setItem('userInformation', JSON.stringify(user))
  });


  const [image, setImage] = useState();
  const [cropData, setCropData] = useState('');
  const [cropper, setCropper] = useState();

  const onChange = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(files[0]);
  };

  const getCropData = () => {
    if (typeof cropper !== "undefined") {
      setCropData(cropper.getCroppedCanvas().toDataURL());
      const message4 = cropper.getCroppedCanvas().toDataURL();
      const storageRef = iref(storage, auth.currentUser.uid);
      uploadString(storageRef, message4, 'data_url').then((snapshot) => {
        getDownloadURL(storageRef).then((downloadURL) => {
          updateProfile(auth.currentUser, {
            photoURL: downloadURL
          }).then(() => {
            setModalshow(false)
          })
        });
      });
    }
  };

  let coverImgInfo = (e) => {
    const storageRef = iref(storage, 'some-child');
    uploadBytes(storageRef, e.target.files[0]).then((snapshot) => {
      getDownloadURL(storageRef).then((downloadURL) => {
        setCoverImg(downloadURL)
      });
    });
  }
  let coverImgSubmit = (e) => {
    set(ref(db, 'coverPhoto/' + data.uid), {
      coverimg: CoverImg,
      admin: data.displayName,
    }).then(() => {
      setCoverModalShow(false)
    })
  }

  useEffect(() => {
    const starCountRef = ref(db, 'userInfo/');
    onValue(starCountRef, (snapshot) => {
      let arr = []
      snapshot.forEach((item) => {
        if (data.uid == item.val().adminid) {

          arr.push(item.val())
        }
      })
      setTitleList(arr)
    });
  }, [])

  useEffect(() => {
    const starCountRef = ref(db, 'coverPhoto/');
    onValue(starCountRef, (snapshot) => {
      let arr = []
      snapshot.forEach((item) => {

        if (data.uid == item.key) {

          arr.push(item.val())
        }

      })
      setCoverList(arr)
    });
  }, [])

  useEffect(() => {
    const starCountRef = ref(db, 'post/');
    onValue(starCountRef, (snapshot) => {
      let arr = []
      snapshot.forEach((item) => {
        if (data.uid == item.val().adminid) {
          arr.push(item.val())

        }
      })
      setPostList(arr)
    });
  }, [])

  return (

    <>
      {
        verify ?

          coverModalShow
            ?
            (<div className='absolute top-0 left-0 bg-primary w-full h-full z-50 flex justify-center items-center'>
              <div className='w-2/4 p-10 bg-white rounded-bl-lg'>
                <h1 className='font-nunito text-2xl font-bold text-primary'>Upload Your Profile Photo </h1>
                <input onChange={coverImgInfo} className='font-nunito text-xl text-primary block mt-5 mb-5' type='file' />
                <img src={CoverImg} />
                <button onClick={coverImgSubmit} className='font-nunito py-3 px-5 bg-primary rounded-bl-lg text-xl text-white  mt-5 inline-block'>Upload</button>
                <button onClick={() => setCoverModalShow(false)} className='font-nunito py-3 px-5 bg-red-500 rounded-bl-lg text-xl text-white ml-5  mt-5 inline-block'>Cancel</button>
              </div>
            </div>)
            : modalShow ?
              (<div className='absolute top-0 left-0 bg-[rgba(0,0,0,.3)] w-full h-full z-50 flex justify-center items-center'>
                <div className='w-2/4 p-10 bg-white rounded-bl-lg'>
                  <h1 className='font-nunito text-2xl font-bold text-primary'>Upload Your Profile Photo </h1>
                  <input onChange={onChange} className='font-nunito text-xl text-primary block mt-5' type='file' />
                  <div className='w-[60px] h-[60px] rounded-full overflow-hidden mx-auto mb-5'>
                    {image &&
                      <div className="img-preview w-full h-full" />
                    }
                  </div>
                  {image &&
                    <div>
                      <Cropper
                        style={{ height: 400, width: "100%" }}
                        zoomTo={0.5}
                        initialAspectRatio={1}
                        preview=".img-preview"
                        src={image}
                        viewMode={1}
                        minCropBoxHeight={10}
                        minCropBoxWidth={10}
                        background={false}
                        responsive={true}
                        autoCropArea={1}
                        checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                        onInitialized={(instance) => {
                          setCropper(instance);
                        }}
                        guides={true}
                      />
                    </div>
                  }
                  <button onClick={getCropData} className='font-nunito py-3 px-5 bg-primary rounded-bl-lg text-xl text-white  mt-5 inline-block'>Upload</button>
                  <button onClick={() => setModalshow(false)} className='font-nunito py-3 px-5 bg-red-500 rounded-bl-lg text-xl text-white ml-5  mt-5 inline-block'>Cancel</button>
                </div>
              </div>)
              :
              (<>
                <Navbar />
                <Container>
                  <div className='w-[800px] mx-auto'>
                    <div className='group relative'>
                      <div className='w-full h-[180px]'>
                        {coverList.length == 0
                          ?
                          <img className='w-full h-full' src='images/profilecover.png' />
                          :
                          coverList.map((item) => (
                            <img className='w-full h-full' src={item.coverimg} />
                          ))
                        }
                      </div>
                      <div onClick={() => setCoverModalShow(true)} className='w-full h-[0%] group-hover:h-[100%] bg-[rgba(0,0,0,.5)]  absolute top-0 left-0  ease-in-out duration-300 flex justify-center items-center'>
                        <MdOutlineCloudUpload className='text-white text-2xl hidden group-hover:block' />
                      </div>
                    </div>
                    {/* profile and cover start */}
                    <div className='flex justify-between gap-x-5'>
                      <div className='w-[170px] h-[170px] rounded-full overflow-hidden mt-[-20px] inline-block relative z-50 group'>
                        {data &&
                          <img className='w-full h-full' src={data.photoURL} />
                        }
                        <div onClick={() => setModalshow(true)} className='w-full h-[0%] group-hover:h-[100%] bg-[rgba(0,0,0,.5)]  absolute top-0 left-0  ease-in-out duration-300 flex justify-center items-center'>
                          <MdOutlineCloudUpload className='text-white text-2xl hidden group-hover:block' />
                        </div>
                      </div>
                      <div className='w-[75%] relative mt-6'>
                        {data &&
                          <h2 className='font-nunito font-bold text-3xl '>{data.displayName}</h2>
                        }
                        {titleList.map((item) => (
                          <div>
                            <p className='font-nunito font-normal text-base mt-3 '>{item.title}</p>
                            <p className='flex gap-x-2 items-center font-nunito font-medium text-base  absolute top-2 right-0'><ImRocket />{item.addres}</p>

                          </div>
                        ))}

                        <button onClick={() => setContactShow(!contactShow)} className='font-nunito font-normal text-xl bg-[#0274AF] w-[170px] py-2 text-white rounded-md mt-3 mb-8'>Contact info</button>
                        {contactShow
                          &&
                          titleList.map((item) => (

                            <div>
                              <h4 className='font-nunito font-medium text-xl text-primary'>Phone:{item.phone} </h4>
                              <h4 className='font-nunito font-medium text-xl text-primary mt-3'>Email: {item.email}</h4>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    {/* fsafhdsahdhf */}
                    <div>
                      <ul class="nav nav-tabs flex flex-col md:flex-row flex-wrap list-none border-b-0 pl-0 mb-4" id="tabs-tabFill"
                        role="tablist">
                        <li class="nav-item flex-auto text-center" role="presentation">
                          <a href="#tabs-homeFill" class="
              nav-link
              w-full
              block
              font-bold
              text-xl
              leading-tight
              font-nunito
              border-x-0 border-t-0 border-b-2 border-transparent
              px-6
              py-3
              my-2
              hover:border-transparent hover:bg-gray-100
              focus:border-transparent
              active
            " id="tabs-home-tabFill" data-bs-toggle="pill" data-bs-target="#tabs-homeFill" role="tab"
                            aria-controls="tabs-homeFill" aria-selected="true">Profile</a>
                        </li>
                        <li class="nav-item flex-auto text-center" role="presentation">
                          <a href="#tabs-profileFill" class="
              nav-link
              w-full
              block
              font-bold
              text-xl
              leading-tight
              font-nunito
              border-x-0 border-t-0 border-b-2 border-transparent
              px-6
              py-3
              my-2
              hover:border-transparent hover:bg-gray-100
              focus:border-transparent
            " id="tabs-profile-tabFill" data-bs-toggle="pill" data-bs-target="#tabs-profileFill" role="tab"
                            aria-controls="tabs-profileFill" aria-selected="false">Friends</a>
                        </li>
                        <li class="nav-item flex-auto text-center" role="presentation">
                          <a href="#tabs-messagesFill" class="
              nav-link
              w-full
              block
              font-bold
              text-xl
              leading-tight
              font-nunito
              border-x-0 border-t-0 border-b-2 border-transparent
              px-6
              py-3
              my-2
              hover:border-transparent hover:bg-gray-100
              focus:border-transparent
            " id="tabs-messages-tabFill" data-bs-toggle="pill" data-bs-target="#tabs-messagesFill" role="tab"
                            aria-controls="tabs-messagesFill" aria-selected="false">Post</a>
                        </li>
                      </ul>
                      <div class="tab-content" id="tabs-tabContentFill">
                        <div class="tab-pane fade show active" id="tabs-homeFill" role="tabpanel" aria-labelledby="tabs-home-tabFill">
                          <div className='p-8'>
                            <h4 className='font-nunito font-bold text-xl text-primary'>About</h4>
                            {titleList.map((item) => (
                              <p className='font-nunito  text-md text-primary mt-3'>{item.about} </p>

                            ))}
                            <p className='font-nunito  text-md uppercase text-primary mt-5'>See more </p>
                          </div>
                        </div>
                        <div class="tab-pane fade" id="tabs-profileFill" role="tabpanel" aria-labelledby="tabs-profile-tabFill">
                          <div className='p-8'>
                            <h4 className='font-nunito font-bold text-xl text-primary'>No Friend available</h4>
                          </div>
                        </div>
                        <div class="tab-pane fade" id="tabs-messagesFill" role="tabpanel" aria-labelledby="tabs-profile-tabFill">
                          {postlist.map((item) => (
                            <div>
                              <div className='flex items-center gap-x-4 pt-14 pb-4 relative '>
                                <img className='w-[60px] h-[60px] rounded-full overflow-hidden' src={data.photoURL} />
                                <div>
                                  <h4 className='font-nunito text-lg font-bold text-primary '>{item.admin}</h4>

                                  {titleList.map((item) => (
                                    <p className='font-nunito text-xs font-normal text-primary '>{item.title}</p>

                                  ))}
                                  <p className='font-nunito font-normal text-xs mt-2 text-[#D7D7D7]'>{moment(item.date, "YYYYMMDD hh:mm").fromNow()}</p>
                                </div>
                                <BsThreeDots className='absolute top-8 right-0' />
                              </div>
                              <div className='mb-16'>
                                <h1 className='font-nunito text-2xl font-bold text-[#181818] mb-3'>{item.post}</h1>
                                <img src={item.img} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* fsafhdsahdhf */}
                    <Project/>
                    {/* experience start */}
                    <div className='mt-10'>
                      <h3 className='font-nunito text-lg font-bold text-primary mb-5'>Experience</h3>
                      <div className='flex gap-x-5 items-center'>
                        <div className='w-[10%]'>
                          <img className='w-full' src='images/icon1.png' />
                        </div>
                        <div className='w-[88%]'>
                          {titleList.map((item) => (
                            <div>
                              <h3 className='font-nunito text-xl font-bold text-primary mb-1'>{item.experience}</h3>
                              <h5 className='font-nunito text-lg font-medium text-primary mb-3'>{item.experienceTitle}</h5>
                              {/*               
              <p className='font-nunito text-sm font-normal  '>Work with clients and web studios as freelancer.  Work in next areas: eCommerce web projects; creative landing pages; iOs and Android apps; corporate web sites and corporate identity sometimes.</p> */}
                            </div>
                          ))}

                        </div>
                      </div>
                      <div className='flex gap-x-5 mt-5'>
                        <div className='w-[10%]'>
                          <img className='w-full ' src='images/icon2.png' />
                        </div>
                        <div className='w-[88%]'>
                          <h3 className='font-nunito text-xl font-bold text-primary mb-1'>UX/UI designer</h3>
                          <h5 className='font-nunito text-lg font-medium text-primary mb-1'>Self Employed</h5>

                          <p className='font-nunito text-sm font-normal '>Work with clients and web studios as freelancer.  Work in next areas: eCommerce web projects; creative landing pages; iOs and Android apps; corporate web sites and corporate identity sometimes.</p>
                        </div>
                      </div>
                    </div>
                    {/* experience start */}
                    <div className='mt-12 mb-12'>
                      <h3 className='font-nunito text-lg font-bold text-primary mb-5'>Education</h3>
                      <div className='flex gap-x-5'>
                        <div className='w-[10%]'>
                          <img className='w-full' src='images/icon1.png' />
                        </div>
                        <div className='w-[88%]'>
                          {titleList.map((item) => (
                            <div>

                              <h3 className='font-nunito text-xl font-bold text-primary mb-1'>{item.schoolName}</h3>
                              <h5 className='font-nunito text-lg font-medium text-primary mb-3'>{item.degree}</h5>
                              <p className='font-nunito text-sm font-normal  '>Additional English classes and UX profile courses​.</p>
                            </div>
                          ))}

                        </div>
                      </div>
                    </div>
                  </div>
                  <Footer />
                </Container>
              </>)
          :
          <div className='absolute top-0 left-0 w-full h-full bg-primary flex justify-center items-center '>
            <h2 className='font-nunito text-2xl font-bold text-white'>Please Verify Your Email </h2>
          </div>

      }
    </>
  )
}

export default Profile