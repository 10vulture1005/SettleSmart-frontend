import React from "react";
import "./hero.css";
import { useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from "@heroui/react"; // Consider using @nextui-org/react if @heroui/react fails
import Spline from "@splinetool/react-spline";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
export const AcmeLogo = () => (
  <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
    <path
      clipRule="evenodd"
      d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export default function HomeHero() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const [user,setUser] = useState(null)
  const handleOnclick=()=>{
    if(user){
      navigate('/Display');
    }else
    navigate('/signup')
  };
  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "Log Out"
  ];





    axios.defaults.withCredentials = true; // ✅ required for cookies

 const fetchCurrentUser = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`);
  return res.data;
  };
  useEffect(() => {
  const getUser = async () => {
    try {
      const user = await fetchCurrentUser();
      setUser(user);
    } catch (err) {
      console.log("Not logged in");
    }
  };

  getUser();
}, []);





  
  const handleOnclickLogin=()=>{
    if(user){
      navigate('/Display');
    }else 
    navigate('/login');
  };
  return (
    <>
      <div className="relative h-screen overflow-hidden bg-transparent text-white dark">
        {/* Fixed Navbar */}
        <Navbar
          onMenuOpenChange={setIsMenuOpen}
          shouldHideOnScroll
          className="fixed top-0 left-0 w-full z-10 bg-transparent backdrop-blur-md"
        >
          <NavbarContent>
            <NavbarMenuToggle
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="sm:hidden"
            />
            <NavbarBrand>
              <AcmeLogo />
            </NavbarBrand>
          </NavbarContent>

          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem>
              <Link color="foreground" href="#" onClick={{}}>
                Features
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href="#">
                Dashboard
              </Link>
            </NavbarItem>
            
          </NavbarContent>

          <NavbarContent justify="end">
            <NavbarItem className="hidden lg:flex">
              <Link  onPress={handleOnclickLogin}>Login</Link>
            </NavbarItem>
            <NavbarItem>
              <Button onPress={handleOnclick} color="primary" href="#" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </NavbarContent>

          <NavbarMenu className="bg-black/80 backdrop-blur-md">
            {menuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  className={`w-full text-lg ${
                    index === menuItems.length - 1
                      ? "text-danger-500"
                      : "text-white"
                  }`}
                  href="#"
                >
                  {item}
                </Link>
              </NavbarMenuItem>
            ))}
          </NavbarMenu>
        </Navbar>

        <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
          <Spline scene="/hero.splinecode" className="w-full h-full" />
        </div>

        {/* Centered Foreground Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold bg-[linear-gradient(285deg,#C3C8CA,#00525E)] bg-clip-text text-transparent opacity-80 text-center px-4">
            Smart Settle
          </h1>
                 <p >
            hello, signup to start
          </p>   
          
        </div>
      </div>
    </>
  );
}
