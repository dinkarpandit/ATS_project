import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, TextField, initializeIcons } from '@fluentui/react';
import styles from "./Login.module.css"
import left from "./assets/login-bg.svg"
import logo from "./logo.svg"
import { useSearchParams } from 'react-router-dom';
import {axiosPrivateCall } from './constants'
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#\$%^&*\(\)_\-\+={}\[\]|\\:;"'<,>\.?/À-Ùà-ù]).{8,}$/;
const loginIcon = { iconName: 'Contact' };
function Reset() {
    initializeIcons();
    const navigateTo = useNavigate();
    const sentIcon = { iconName: 'Accept'};
    const [searchParams, setSearchParams] = useSearchParams();
    const [password ,setPassword] = useState(null);
    const [confirm_password, setConfirmPassword] = useState('');
    const [loginError,setLoginError] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [errors,setErrors] = useState({
      password:'',
      confirm_password:''
    }); 
    const [isMatch, setMatch] = useState(false);
    localStorage.setItem('token',searchParams.get("token"));

    const inputChangeHandler =(e,name,setData)=>{
      const {value} = e.target;
      let inputValue = value;
  
      let isNameValid = false
      if (name === 'password' && (!passRegex.test(inputValue)|| inputValue.length >8 || inputValue.length <64)
      ) {
        if (inputValue.length > 64) {
          inputValue = inputValue.slice(0, 64);
          
        }
        isNameValid = true;
      }
      if(name==='confirm_password'){
        if(inputValue.length > 64) inputValue = inputValue.slice(0,64)
        isNameValid= true
      }
      if(isNameValid){
        setData(inputValue)
      }
      if (value.trim() !== '' || isNameValid) {
        setErrors({
            ...errors,
            [name]: '', // Reset the specific error for the current input field
        });
    }
console.log(errors,'errrrr')
    };
    function checkMatch () {
      if (password === confirm_password && password && confirm_password)
      {
        setMatch('Confirmed!')
      } 
      else{
        setMatch('')
      }
    }
console.log(confirm_password,'vvvvee')
    const resetHandler = () =>{
      console.log('triggered')
      const isPasswordValid = isPassValid(password, confirm_password);
      console.log(password,"ooooppp")
      console.log(confirm_password,"ooooc")
      console.log(isPasswordValid, "oooooooooo")
      console.log(isMatch,"oooom")
          if (isMatch && isPasswordValid)
      {
        let userData = {new_password: password,};
            axiosPrivateCall.post('/api/v1/employee/resetPassword',userData).then(res=>{
              localStorage.removeItem('token');
              navigateTo('/login')
            }).catch( e =>{
              setErrors({...errors, password: 'Password Reset Failed'})
            })      
      }
    }
    const submitHandler = (data) =>{
      const errorObj ={};
      if(isPassValid(data) ){
        errorObj.password = 'Invalid Password3'
      } 
      return errorObj
    }
    useEffect(() => {checkMatch();}, [confirm_password, password])
      // useEffect(() => {
        
      // isPassValid(password,confirm_password)
      // },[confirm_password, password])





    const isPassValid = (value, confirmValue) => {
      console.log('cccc', confirmValue);
    console.log(value,"vvvv")
    console.log(confirmValue,"dinkar")
      if (!value || value.length === 0) {
        errors.password = "Required";
      } else if (value.length < 8) {
        errors.password = "Password should be at least 8 characters";
      } 
      else {
        if (!/\d/.test(value)) {
          errors.password = "Password must contain at least one digit";
        } else if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
          errors.password = "Password must contain both lowercase and uppercase letters";
        } else if (!/[!@#$%^&*()]/.test(value)) {
          errors.password = "Password must contain at least one special character";
        }
        else{
          errors.password="";
        }
       }  
      if (!confirmValue || confirmValue.length === 0)
      {
        errors.confirm_password="Required"
      } else if (confirmValue!==value) {
        errors.confirm_password="Does not matches" 
      }
      else{
        errors.confirm_password="";
      }
    console.log(errors,"ero")
      setErrors((prevState) => ({
  ...prevState,
  ...errors,
}));
if (Object.keys(errors) === ""){
return false
}
  return true
    };
  return (
    <>
      <div className={styles.container}>
        <div className={styles.hero_container}>
            <img src={left} className={styles.hero_img}/>
        </div>
        <div className={styles.login_container}>
          {isLogin ? <div className={styles.login_container}>
            <div className={styles.logo}><img src={logo}/></div>
            <div className={styles.title}>Set New Password</div>
            <div className={styles.description}>Your new password must be different to previously used password. </div>
            <div>
              <div className={styles.input_container}>
                <TextField 
                        styles={errors.password ? passFieldError : passField}  
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        canRevealPassword
                        revealPasswordAriaLabel="Show password"
                        onChange={(e)=>{inputChangeHandler(e,'password',setPassword)}} 
                        value={password}
                    />

                <div className={styles.error}>{errors.password ? <div>{errors.password}</div> : null}</div>

                <TextField 
                    styles={(isMatch && !errors.password) ? passFieldMatch : passField}  
                    type="password" 
                    name="confirm_password" 
                    placeholder="Confirm Password" 
                    canRevealPassword
                    revealPasswordAriaLabel="Show password"
                    onChange={(e)=>{inputChangeHandler(e,'password',setConfirmPassword); isPassValid(password,confirm_password);}} 
                    value={confirm_password}
                />
              <div className={(!isMatch && errors.confirm_password) ? styles.error :styles.error2}>{(!isMatch && errors.confirm_password) ? <div>{errors.confirm_password}</div> :<div>{isMatch}</div> }</div>
              </div> 
            </div>
            <PrimaryButton text="Reset Password" onClick={() => resetHandler()} className={styles.login_button}/>
            <div className={styles.back} onClick={() => navigateTo('/login')}>Back to Login</div>
          </div> : null}

        </div>
      </div>      
    </>
  );
}
function passField(props) {
  return ({fieldGroup: [{borderColor: 'grey'},],
  revealButton:[{backgroundColor: 'transparent', color:'grey', "&:hover": {backgroundColor: 'transparent',color:'grey',}}],})
}
function passFieldError(props) {
  return ({fieldGroup: [{borderColor: '#a80000'},],
  revealButton:[{backgroundColor: 'transparent', color:'grey', "&:hover": {backgroundColor: 'transparent',color:'grey',}}],})
}
function passFieldMatch(props) {
  return ({fieldGroup: [{borderColor: 'green'},],
  revealButton:[{backgroundColor: 'transparent', color:'grey', "&:hover": {backgroundColor: 'transparent',color:'grey',}}],})
}
export default Reset;