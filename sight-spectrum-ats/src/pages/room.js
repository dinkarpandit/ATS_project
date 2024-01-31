// import React, { useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import styles from './Room.module.css'
// const socket = io('http://localhost:5000');

// const Room = () => {
//     const localVideoRef = useRef();
//     const remoteVideoRef = useRef();
//     const peerConnectionRef = useRef();

//     useEffect(() => {
//         const startMedia = async () => {
//             try {
//                 const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//                 handleLocalStream(stream);
//             } catch (error) {
//                 console.error('Error accessing media devices:', error);
//             }
//         };

//         startMedia();

//         socket.on('offer', handleOffer);
//         socket.on('answer', handleAnswer);
//         socket.on('ice-candidate', handleIceCandidate);

//         return () => {
//             socket.off('offer', handleOffer);
//             socket.off('answer', handleAnswer);
//             socket.off('ice-candidate', handleIceCandidate);
//         };
//     }, []);

//     const handleLocalStream = (stream) => {
//         localVideoRef.current.srcObject = stream;

//         const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
//         peerConnectionRef.current = new RTCPeerConnection(configuration);

//         // Add local stream to peer connection
//         stream.getTracks().forEach((track) => {
//             peerConnectionRef.current.addTrack(track, stream);
//         });

//         // Set up event handlers for the connection
//         peerConnectionRef.current.onicecandidate = handleIceCandidateEvent;
//         peerConnectionRef.current.onnegotiationneeded = handleNegotiationNeededEvent;
//         peerConnectionRef.current.ontrack = handleTrackEvent;
//     };

//     const handleNegotiationNeededEvent = async () => {
//         try {
//             const offer = await peerConnectionRef.current.createOffer();
//             await peerConnectionRef.current.setLocalDescription(offer);

//             socket.emit('offer', offer);
//         } catch (error) {
//             console.error('Error creating offer:', error);
//         }
//     };

//     const handleOffer = async (offer) => {
//         try {
//             await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));

//             const answer = await peerConnectionRef.current.createAnswer();
//             await peerConnectionRef.current.setLocalDescription(answer);

//             socket.emit('answer', answer);
//         } catch (error) {
//             console.error('Error handling offer:', error);
//         }
//     };

//     const handleAnswer = async (answer) => {
//         try {
//             await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//         } catch (error) {
//             console.error('Error handling answer:', error);
//         }
//     };

//     const handleIceCandidateEvent = (event) => {
//         if (event.candidate) {
//             socket.emit('ice-candidate', event.candidate);
//         }
//     };

//     const handleIceCandidate = async (candidate) => {
//         try {
//             await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (error) {
//             console.error('Error handling ice candidate:', error);
//         }
//     };

//     const handleTrackEvent = (event) => {
//         remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     return (
//         <div className={styles.main_container}>

//             <div>
//                 <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '200px', height: '150px' }} />
//                 <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '200px', height: '150px' }} />
//             </div>
//         </div>
//     );
// };

// export default Room;
