"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from '@/firebase'
import { styled, Box, Typography, Modal, Stack, TextField, Button, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { collection, setDoc, getDoc, deleteDoc, doc, getDocs, query } from "firebase/firestore";
import {useAuthState} from 'react-firebase-hooks/auth';
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { storage } from '@/firebase'; 
import { ref, uploadBytesResumable, getDownloadURL,  } from 'firebase/storage';




export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [uploadopen, setUploadopen] = useState(false);
  const [itemName, setItemname] = useState([]);

  //
  const [imageUrl, setImageUrl] = useState('');
  const [responseText, setResponseText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    if (!imageUrl) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('imageUrl', imageUrl);

    try {
      const response = await fetch('/api/gemeni', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setResponseText(data.text);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  //
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState(null); // Add state for download URL

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      console.log('Selected file:', selectedFile);
      uploadFile(selectedFile); // Call uploadFile when a file is selected
    }
  };

  const uploadFile = (file) => {
    if (!file) return;
    const storageRef = ref(storage, `/gemeni-images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
      },
      (error) => {
        console.error("Upload Error:", error); // Handle errors
      },
      () => {
        // Upload completed successfully
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => {
            setDownloadURL(url);
            console.log("File uploaded successfully:", url);
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
          });
      }
    );
  };
  //
  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });


  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList);
    console.log(inventoryList);
  }


  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      }
      else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }

    await updateInventory();

  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })

    } else {
      await setDoc(docRef, { quantity: 1 })
    }

    await updateInventory();

  }

  const func = async (e) => {
    handleChangefile(e);
  }

  useEffect(() => {
    updateInventory();
  }, []);

  const funct = () => {
    setImageUrl(downloadURL); 
    handleSubmit(); 
  }


  const handleOpen = () => setOpen(true)
  const handleCLose = () => setOpen(false)
  const handleUploadopen = () => setUploadopen(true)
  const handleUploadclose = () => setUploadopen(false)


  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      position="relative" // Ensure content is layered correctly
      sx={{
        // Ensure content scales properly on smaller screens
        overflow: 'auto',
      }}
    >

      <Box
        component="div"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1, // Ensure it is behind the content
        }}
      >
        <img
          src="https://wallpapers.com/images/featured/plain-black-background-02fh7564l8qq4m6d.jpg"
          alt="Background"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      <h1 style={{ color: 'white' }}>SmartPantry</h1>
      <Modal
        open={open}
        onClose={handleCLose}>
        <Box
          position="absolute" top="50%" left="50%"
          width={400}
          bgcolor="white"
          boder="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%,-50%)',
          }}

        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemname(e.target.value)
              }}
            />
            <Button variant="outlined"
              style={{ backgroundColor: "black", color: 'white' }}
              onClick={() => {
                addItem(itemName)
                setItemname('')
                handleCLose()
              }}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={uploadopen}
        onClose={handleUploadclose}>
        <Box
          position="absolute" top="50%" left="50%"
          width={600}
          bgcolor="white"
          boder="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%,-50%)',
          }}

        >
          <Box direction="column" spacing={2}>
            <Typography variant="h6">Upload Image</Typography>
            <Typography variant="h6">Upload Progress: {progress}%</Typography>
          </Box>

          <Stack width="100%" direction="column" spacing={5}>


            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
            >
              Upload file
              <VisuallyHiddenInput type="file" onChange={handleFileChange} />
            </Button>
            <img src={downloadURL} />
            
            {/* <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Submit'}
              </button>
            </form> */}
            <Button onClick={funct}>What is this?</Button>
            <p>{responseText}</p>
          </Stack>
        </Box>
      </Modal>
      <Stack
        direction="row"
        spacing={2}
      >
        <Button variant="contained" style={{ backgroundColor: "white", color: 'black' }} onClick={() => {
          handleOpen()
        }}>Add New Item</Button>
        <Button variant="contained" style={{ backgroundColor: "white", color: 'black' }} onClick={() => {
          handleUploadopen()
        }}>Upload Image
        </Button>
        <Button style={{ backgroundColor: "white", color: 'black' }} onClick={() => {
          signOut(auth)
          sessionStorage.removeItem('user')
          router.push('/sign-in')
        }}>Log Out
        </Button>
      </Stack>
      <Box border="1px solid #333">
        <Box width="800px"
          height="100px"
          bgcolor="#ffffff"
          display="flex"
          variant="h2"
          alignItems="center"
          justifyContent="center"
          sx={{
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <Typography variant="h6" color="#000000" >
            Inventory Items

          </Typography>

        </Box>
        <Stack
          width="800px"
          height="300px"
          spacing={2}
          overflow="auto">
          {
            inventory.map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                minHeight="150px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="white"
                padding={5}
                sx={{
                  borderTop: '4px solid black',
                  borderBottom: '4px solid black'

                }}
              >
                <Typography variant='h3' color="#000000" textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant='h3' color='#333' textAlign="center">
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained"
                    style={{ backgroundColor: "black", color: 'white' }}

                    onClick={() => {
                      addItem(name)
                    }}>
                    Add
                  </Button>
                  <Button variant="contained"
                    style={{ backgroundColor: "black", color: 'white' }}

                    onClick={() => {
                      removeItem(name)
                    }}>
                    Remove
                  </Button>
                </Stack>


              </Box>

            ))
          }
        </Stack>
      </Box>
    </Box>
  )
}
