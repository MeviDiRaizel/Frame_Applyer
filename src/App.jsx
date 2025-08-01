import React, { useState, useRef, useEffect } from 'react';
import { Box, VStack, Image, Text, Button, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, useColorMode, IconButton, Container, useToast,  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Link, } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
const getAssetPath = (path) => {
  // For GitHub Pages deployment
  if (import.meta.env.PROD) {
    return `/Frame_Applyer/${path}`;
  }
  // For local development
  return `/${path}`;
};

function useCardPulseStyle() {
  useEffect(() => {
    if (!document.head.querySelector('style[data-github-card-pulse]')) {
      const style = document.createElement('style');
      style.setAttribute('data-github-card-pulse', 'true');
      style.innerHTML = `@keyframes pulse-card {
        0% {
          box-shadow: 0 0 0 0 #3182ce88;
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 0 24px #3182ce22, 0 0 16px 8px #3182ce88;
          transform: scale(1.06);
        }
        100% {
          box-shadow: 0 0 0 0 #3182ce88;
          transform: scale(1);
        }
      }`;
      document.head.appendChild(style);
    }
  }, []);
}


function App() {
  useCardPulseStyle();

  const DEFAULT_FRAME = {
    enabled: true,
    url: getAssetPath("frames/DPBlastSY2025-2026.png"),
    allowRemoval: false,
  };

  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: true });
  const [frameImage, setFrameImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const compositeRef = useRef(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [logoClicks, setLogoClicks] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  // Fallback modal for iOS/Safari manual save
  const [fallbackImageUrl, setFallbackImageUrl] = useState(null);

  // Define the desired resolution for the downloaded image
  const desiredWidth = 1200;
  const desiredHeight = 1200;

  // Modify the useEffect to set default frame on component mount
useEffect(() => {
  // Check if default frame is enabled and no frame is currently set
  if (DEFAULT_FRAME.enabled && !frameImage) {
    setFrameImage(DEFAULT_FRAME.url);
  }
}, []); // Run once on mount



  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  const isSafari = () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  };

  const isMobileSafari = () => {
    return isIOS() && isSafari();
  };

  const triggerModalConfetti = () => {
    // Create multiple confetti bursts from different positions around the modal
    const positions = [
      { x: 0.3, y: 0.3 },
      { x: 0.7, y: 0.3 },
      { x: 0.5, y: 0.5 },
      { x: 0.3, y: 0.7 },
      { x: 0.7, y: 0.7 }
    ];
  
    positions.forEach((pos, index) => {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: pos,
          colors: ['#1a365d', '#2a4365', '#2c5282', '#2b6cb0', '#3182ce'],
          startVelocity: 45,
          gravity: 0.8,
          scalar: 1.2,
        });
      }, index * 150); // Stagger the confetti bursts
    });
  };

  const triggerConfetti = () => {
    // Create confetti burst from the logo position
    const logoElement = document.querySelector('[alt="CCIS Logo"]');
    if (logoElement) {
      const rect = logoElement.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#1a365d', '#2a4365', '#2c5282', '#2b6cb0', '#3182ce'], // Blue shades
        startVelocity: 30,
        gravity: 0.8,
        scalar: 0.7,
      });
    }
  };


  const handleLogoClick = () => {
    const newClickCount = logoClicks + 1;
    setLogoClicks(newClickCount);
    
    triggerConfetti();
    
    if (newClickCount === 5) {
      setIsVideoOpen(true);
    } else if (newClickCount === 1) {
      toast({
        title: "You have found a secret : O",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    } else if (newClickCount < 5) {
      toast({
        title: `${5 - newClickCount} clicks away`,
        status: "info",
        duration: 1000,
        isClosable: true,
        position: "top",
      });
    }
  
    setTimeout(() => {
      setLogoClicks(0);
    }, 3000);
  };
  

  const adjustViewportForDesktopMode = () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      // Check if we're in desktop mode on mobile
      if (window.innerWidth !== window.screen.width) {
        viewport.setAttribute('content', 'width=1024, initial-scale=1, shrink-to-fit=yes');
      } else {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    }
  };

  // Add this useEffect after the existing mobile detection useEffect
useEffect(() => {
  adjustViewportForDesktopMode();
  window.addEventListener('resize', adjustViewportForDesktopMode);
  
  return () => {
    window.removeEventListener('resize', adjustViewportForDesktopMode);
  };
}, []);

  

  const getDesktopModeInstructions = () => {
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      return "Safari: Tap 'aA' in the address bar and select 'Request Desktop Website'";
    } else if (/Android/.test(navigator.userAgent)) {
      return "Chrome: Tap ⋮ (three dots) > Request Desktop Site";
    }
    return "Please enable desktop mode in your browser settings";
  };

  useEffect(() => {
    if (isMobile()) {
      onOpen();
    }
  }, [onOpen]);


  const handleTouchStart = (e) => {
    if (profileImage) {
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = true;
      const touch = e.touches[0];
      lastPosition.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      };
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      const newX = touch.clientX - lastPosition.current.x;
      const newY = touch.clientY - lastPosition.current.y;
      setPosition({
        x: newX,
        y: newY
      });
    }
  };
  
  const handleTouchEnd = (e) => {
    e.preventDefault();
    isDragging.current = false;
  };

  const handleFrameDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFrameImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        toast({
          title: "Thank you for using!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top", 
          variant: "solid", 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFrameInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFrameImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        toast({
          title: "Thank you for using!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top", 
          variant: "solid", 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    if (profileImage) {
      e.preventDefault(); // Prevent default dragging behavior
      isDragging.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      lastPosition.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      e.preventDefault(); // Prevent default dragging behavior
      const newX = e.clientX - lastPosition.current.x;
      const newY = e.clientY - lastPosition.current.y;
      setPosition({
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault(); // Prevent default dragging behavior
    isDragging.current = false;
  };

  // Helper function to generate image using Canvas (for iOS)
  const generateImageWithCanvas = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = desiredWidth;
    canvas.height = desiredHeight;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, desiredWidth, desiredHeight);
    
    // Load images
    const profileImg = new Image();
    const frameImg = new Image();
    
    // Create promises for image loading
    const loadProfileImage = new Promise((resolve, reject) => {
      profileImg.onload = resolve;
      profileImg.onerror = reject;
      profileImg.src = profileImage;
    });
    
    const loadFrameImage = new Promise((resolve, reject) => {
      frameImg.onload = resolve;
      frameImg.onerror = reject;
      frameImg.src = frameImage;
    });
    
    // Wait for both images to load
    await Promise.all([loadProfileImage, loadFrameImage]);
    
    // Calculate scaling factors to maintain aspect ratio
    const profileAspectRatio = profileImg.width / profileImg.height;
    
    // Calculate profile image dimensions with scale
    let profileWidth = desiredWidth * scale;
    let profileHeight = profileWidth / profileAspectRatio;
    
    if (profileHeight > desiredHeight * scale) {
      profileHeight = desiredHeight * scale;
      profileWidth = profileHeight * profileAspectRatio;
    }
    
    // Calculate center position
    const centerX = desiredWidth / 2;
    const centerY = desiredHeight / 2;
    
    // Apply position offset (convert from viewport coordinates to canvas coordinates)
    const positionScaleX = desiredWidth / compositeRef.current.offsetWidth;
    const positionScaleY = desiredHeight / compositeRef.current.offsetHeight;
    const adjustedPositionX = position.x * positionScaleX;
    const adjustedPositionY = position.y * positionScaleY;
    
    // Draw profile image with transformations
    ctx.save();
    ctx.translate(centerX + adjustedPositionX, centerY + adjustedPositionY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      profileImg,
      -profileWidth / 2,
      -profileHeight / 2,
      profileWidth,
      profileHeight
    );
    ctx.restore();
    
    // Draw frame image on top
    ctx.drawImage(frameImg, 0, 0, desiredWidth, desiredHeight);
    
    // Convert canvas to data URL
    return canvas.toDataURL('image/png', 1.0);
  };

  // Helper function to generate image using html-to-image (for non-iOS)
  const generateImageWithHtmlToImage = async () => {
    // Create a temporary clone of the compositeRef element
    const compositeClone = compositeRef.current.cloneNode(true);

    // Apply the same styles to the clone as the original
    compositeClone.style.width = `${desiredWidth}px`;
    compositeClone.style.height = `${desiredHeight}px`;
    compositeClone.style.position = 'relative';
    compositeClone.style.overflow = 'hidden';
    compositeClone.style.transform = 'none';

    // Adjust styles for profile image within the clone
    const profileImageClone = compositeClone.querySelector('img[alt="Profile"]');
    if (profileImageClone) {
      profileImageClone.style.position = 'absolute';
      profileImageClone.style.width = '100%';
      profileImageClone.style.height = '100%';
      profileImageClone.style.objectFit = 'contain';
      profileImageClone.style.left = '0';
      profileImageClone.style.top = '0';
      profileImageClone.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`;
      profileImageClone.style.transformOrigin = 'center';
    }

    // Adjust styles for frame image within the clone
    const frameImageClone = compositeClone.querySelector('img[alt="Frame"]');
    if (frameImageClone) {
      frameImageClone.style.position = 'absolute';
      frameImageClone.style.top = '0';
      frameImageClone.style.left = '0';
      frameImageClone.style.width = '100%';
      frameImageClone.style.height = '100%';
      frameImageClone.style.objectFit = 'fill';
      frameImageClone.style.transform = 'none';
    }

    // Append the clone to the document body
    document.body.appendChild(compositeClone);

    try {
      // Wait a moment for the clone to be properly rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Generate the image
      const dataUrl = await toPng(compositeClone, {
        quality: 1.0,
        pixelRatio: 2,
        width: desiredWidth,
        height: desiredHeight,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        style: {
          width: `${desiredWidth}px`,
          height: `${desiredHeight}px`,
          transform: 'none',
          position: 'relative',
          overflow: 'hidden',
        },
        filter: (node) => {
          // Filter out any problematic nodes
          return node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE';
        },
      });

      return dataUrl;
    } finally {
      // Remove the clone from the DOM
      document.body.removeChild(compositeClone);
    }
  };

  const downloadImage = async () => {
    if (!compositeRef.current || !profileImage || !frameImage) {
      toast({
        title: "No image to download",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      let dataUrl;

      // Use different methods based on platform
      if (isIOS() || isMobileSafari()) {
        // For iOS, use Canvas method (more reliable)
        dataUrl = await generateImageWithCanvas();
      } else {
        // For other platforms, use html-to-image (better quality and positioning)
        dataUrl = await generateImageWithHtmlToImage();
      }

      // Verify the data URL is valid
      if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
        throw new Error('Generated image is invalid or empty');
      }

      // Check if we're on iOS Safari (which blocks downloads)
      if (isMobileSafari() || isIOS()) {
        // iOS Safari blocks downloads, so show fallback immediately
        setFallbackImageUrl(dataUrl);
        toast({
          title: "Manual Save Required",
          description: "Tap and hold the image in the modal to save it to your device.",
          status: "info",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
      } else {
        // For other browsers, try blob-based download
        try {
          // Convert to blob
          const response = await fetch(dataUrl);
          if (!response.ok) {
            throw new Error('Failed to create blob');
          }
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          // Try to download
          const link = document.createElement('a');
          link.href = url;
          link.download = 'profile-frame.png';
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the object URL
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 100);

          // Show success message
          toast({
            title: "Download started!",
            description: (
              <span>
                If you enjoyed this tool, consider checking out my
                <a
                  href="https://github.com/MeviDiRaizel"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#3182ce', textDecoration: 'underline', marginLeft: 4 }}
                >
                  GitHub profile
                </a>!
              </span>
            ),
            status: "success",
            duration: 6000,
            isClosable: true,
            position: "top",
          });

        } catch (blobError) {
          console.error('Blob download failed:', blobError);
          
          // Fallback to data URL download
          try {
            const link = document.createElement('a');
            link.download = 'profile-frame.png';
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast({
              title: "Download started!",
              description: (
                <span>
                  If you enjoyed this tool, consider checking out my
                  <a
                    href="https://github.com/MeviDiRaizel"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3182ce', textDecoration: 'underline', marginLeft: 4 }}
                  >
                    GitHub profile
                  </a>!
                </span>
              ),
              status: "success",
              duration: 6000,
              isClosable: true,
              position: "top",
            });
            
          } catch (fallbackError) {
            console.error('Fallback download failed:', fallbackError);
            // Show fallback modal as last resort
            setFallbackImageUrl(dataUrl);
            toast({
              title: "Manual Save Required",
              description: "Tap and hold the image in the modal to save it to your device.",
              status: "info",
              duration: 4000,
              isClosable: true,
              position: "top",
            });
          }
        }
      }

    } catch (error) {
      console.error('Image generation failed:', error);
      
      // If we're on iOS, try to show a more helpful error
      if (isIOS()) {
        toast({
          title: "iOS Download Issue",
          description: "iOS requires manual save. The image should appear in a modal for you to save manually.",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast({
          title: "Failed to generate image",
          description: "Please try again",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    }
  };

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} transition="background 0.2s">
     <Container 
  maxW="container.md" 
  py={4} 
  px={{ base: 2, md: 8 }}
  mx="auto"
  style={{
    maxWidth: '100%',
    margin: '0 auto',
    overflow: 'hidden',
    width: window.innerWidth !== window.screen.width ? '1024px' : 'auto'
  }}
>
      <VStack spacing={4} minH="calc(100vh - 8rem)" justify="center" pb={8}>
        <HStack w="full" justify="space-between">
  <HStack spacing={3}>
          <Image
          src={getAssetPath("img/CCISLOGO.png")}
          alt="CCIS Logo"
          w="64px"
          h="64px"
        cursor="pointer"
        onClick={handleLogoClick}
        transition="transform 0.2s"
        _hover={{ transform: 'scale(1.05)' }}
      />
    <Text fontSize="2xl" fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
      Jed's Frame Applyer
    </Text>
  </HStack>
  <IconButton
    icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
    onClick={toggleColorMode}
    variant="ghost"
    colorScheme={colorMode === 'dark' ? 'yellow' : 'blue'}
    aria-label="Toggle color mode"
  />
</HStack>
          
          {!frameImage ? (
            <Box
            w="450px"  
            h="450px"  
            border="2px solid"
            borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
            borderRadius="xl"
            position="relative"
            overflow="hidden"
            ref={compositeRef}
            p={4}
            onDrop={handleFrameDrop}
            onDragOver={handleDragOver}
            bg={colorMode === 'dark' ? 'gray.700' : 'white'}
            transition="all 0.2s"
            _hover={{ borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500' }}
            mb={4}
            >
              <VStack h="100%" justify="center">
                <Text textAlign="center" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                  First, drag and drop your frame image here or click to upload
                </Text>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFrameInput}
                  style={{ display: 'none' }}
                  id="frame-input"
                />
                <Button
                  as="label"
                  htmlFor="frame-input"
                  colorScheme="blue"
                  variant="solid"
                  _hover={{ transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  Choose Frame
                </Button>
              </VStack>
            </Box>
          ) : (
            <>
              <Box
  w={{ base: "100%", md: "450px" }}
  h={{ base: "100vw", md: "450px" }}
  border="2px solid"
  borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
  borderRadius="xl"
  position="relative"
  overflow="hidden"
  ref={compositeRef}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  bg={colorMode === 'dark' ? 'gray.700' : 'white'}
  boxShadow="lg"
  style={{ aspectRatio: '1/1', touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
>
  {profileImage && (
    <Image
      src={profileImage}
      alt="Profile"
      position="absolute"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'center',
        cursor: isDragging.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
      w="100%"
      h="100%"
      objectFit="contain"
      draggable="false"
    />
  )}
  <Image
    src={frameImage}
    alt="Frame"
    position="absolute"
    top="0"
    left="0"
    w="100%"
    h="100%"
    pointerEvents="none"
    draggable="false"
  />
</Box>
              {(!DEFAULT_FRAME.enabled || DEFAULT_FRAME.allowRemoval) && (
                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={() => setFrameImage(null)}
                  _hover={{ transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  Remove Frame
                </Button>
              )}

              {!profileImage ? (
                <Box
                w={{ base: "100%", md: "450px" }}
                border="2px dashed"
                borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
                borderRadius="xl"
                p={4}
                  onDrop={handleProfileDrop}
                  onDragOver={handleDragOver}
                  bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                  transition="all 0.2s"
                  _hover={{ borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500' }}
                >
                  <VStack h="100%" justify="center">
                    <Text textAlign="center" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                      Now, add your profile picture
                    </Text>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileInput}
                      style={{ display: 'none' }}
                      id="profile-input"
                    />
                    <Button
                      as="label"
                      htmlFor="profile-input"
                      colorScheme="blue"
                      variant="solid"
                      _hover={{ transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                    >
                      Choose Profile Picture
                    </Button>
                  </VStack>
                </Box>
              ) : (
                <VStack
                w={{ base: "100%", md: "450px" }}
                spacing={4}
                p={{ base: 3, md: 6 }}
                bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                borderRadius="xl"
                boxShadow="lg"
                >
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium">
                    Adjust your image:
                  </Text>
                  <VStack w="100%" spacing={2}>
                    <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                      Scale
                    </Text>
                    <Slider
                      value={scale}
                      min={0.1}
                      max={2}
                      step={0.1}
                      onChange={setScale}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                  </VStack>
                  <VStack w="100%" spacing={2}>
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium">
                      Rotation
                    </Text>
                    <Slider
                      value={rotation}
                      min={-180}
                      max={180}
                      step={1}
                      onChange={setRotation}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                  </VStack>
                  <HStack spacing={4}>
                    <Button
                      colorScheme="red"
                      variant="outline"
                      onClick={() => {
                        setProfileImage(null);
                        setScale(1);
                        setRotation(0);
                        setPosition({ x: 0, y: 0 });
                      }}
                      _hover={{ transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                    >
                      Remove Picture
                    </Button>
                    <Button
                      colorScheme="green"
                      onClick={downloadImage}
                      _hover={{ transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                    >
                      Download
                    </Button>
                    <Button
                      colorScheme="orange"
                      onClick={async () => {
                        // Force fallback modal with current composite image
                        if (compositeRef.current && profileImage && frameImage) {
                          try {
                            let dataUrl;
                            
                            // Use different methods based on platform
                            if (isIOS() || isMobileSafari()) {
                              // For iOS, use Canvas method
                              dataUrl = await generateImageWithCanvas();
                            } else {
                              // For other platforms, use html-to-image
                              dataUrl = await generateImageWithHtmlToImage();
                            }
                            
                            setFallbackImageUrl(dataUrl);
                          } catch (error) {
                            console.error('Failed to generate test image:', error);
                            toast({
                              title: "Test Failed",
                              description: "Could not generate test image",
                              status: "error",
                              duration: 3000,
                              isClosable: true,
                            });
                          }
                        }
                      }}
                      _hover={{ transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                      size="sm"
                    >
                      Test Fallback
                    </Button>
                  </HStack>
                </VStack>
              )}
            </>
          )}
        <VStack spacing={1} pt={2}>
          <HStack
            spacing={3}
            justify="center"
            bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
            borderRadius="xl"
            p={3}
            boxShadow="md"
            transition="background 0.2s"
            _hover={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200', boxShadow: '0 0 0 4px #3182ce55' }}
            style={{ cursor: 'pointer', animation: 'pulse-card 2.2s infinite', boxShadow: '0 0 0 0 #3182ce33' }}
            onClick={() => window.open('https://github.com/MeviDiRaizel', '_blank', 'noopener noreferrer')}
          >
            <Image
              src={getAssetPath("img/mevidiraizel.jpg")}
              alt="Jed's GitHub Avatar"
              boxSize="40px"
              borderRadius="full"
              border={colorMode === 'dark' ? '2px solid #3182ce' : '2px solid #2b6cb0'}
              boxShadow="sm"
              crossOrigin="anonymous"
            />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="md" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                Jed (MeviDiRaizel)
              </Text>
              <Link
                href="https://github.com/MeviDiRaizel"
                isExternal
                fontSize="sm"
                color={colorMode === 'dark' ? 'blue.200' : 'blue.600'}
                _hover={{ textDecoration: 'underline', color: colorMode === 'dark' ? 'blue.300' : 'blue.800' }}
              >
                github.com/MeviDiRaizel
              </Link>
            </VStack>
          </HStack>
        </VStack>
      </VStack>
    </Container>
    <Modal 
        isOpen={isOpen && isMobile()} 
        onClose={() => {}} // Empty function to prevent closing
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent m={4}>
          <ModalHeader color={colorMode === 'dark' ? 'white' : 'gray.800'}>
            Desktop Mode Required
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                This app requires desktop mode due to bugged final image download on mobile. Please enable desktop mode in your browser:
              </Text>
              <Text fontWeight="bold">
                {getDesktopModeInstructions()}
              </Text>
              <Text fontSize="sm">
                After enabling desktop mode, the page will refresh automatically.  
              </Text>
              <Text fontSize="sm">
                Thanks! - Jed ❤️ 
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              w="full"
              onClick={() => {
                // This will force a page refresh after they enable desktop mode
                window.location.reload();
              }}
            >
              I've Enabled Desktop Mode
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal 
  isOpen={isVideoOpen} 
  onClose={() => setIsVideoOpen(false)}
  isCentered
  size="xl"
  onEnter={() => triggerModalConfetti()} // Add this
>
  <ModalOverlay />
  <ModalContent 
    bg="transparent" 
    boxShadow="none"
    onAnimationEnd={() => triggerModalConfetti()} // Add this as backup
  >
    <ModalCloseButton 
      color="white" 
      zIndex="2"
    />
    <VStack spacing={4}>
      <video
        autoPlay
        controls
        style={{ 
          borderRadius: '10px',
          width: '100%',
          height: 'auto',
        }}
        onLoadStart={(e) => {
          e.target.volume = 0.25;
          triggerModalConfetti(); // Add this to ensure confetti triggers
        }}
      >
        <source src={getAssetPath("secret/secret.mp4")} type="video/mp4" />
      </video>
      <Text
        fontSize="6xl"
        fontWeight="bold"
        color="white"
        textShadow="2px 2px 4px rgba(0,0,0,0.5)"
        letterSpacing="wider"
      >
        GG, you found the secret! - Jed ❤️
      </Text>
    </VStack>
  </ModalContent>
</Modal>

    {/* Fallback Modal for iOS/Safari manual save */}
    <Modal isOpen={!!fallbackImageUrl} onClose={() => setFallbackImageUrl(null)} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manual Save Required</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Text fontWeight="bold" textAlign="center">
              Tap and hold the image below, then choose "Save Image" to save to your device.
            </Text>
            {fallbackImageUrl && (
              <Box 
                w="100%" 
                borderRadius="md" 
                boxShadow="lg" 
                overflow="hidden"
                border="2px solid"
                borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
              >
                <Image 
                  src={fallbackImageUrl} 
                  alt="Generated Frame" 
                  w="100%" 
                  h="auto"
                  draggable="false"
                  style={{ 
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    pointerEvents: 'auto'
                  }}
                />
              </Box>
            )}
            <Text fontSize="sm" color="gray.500" textAlign="center">
              This is required on iOS/Safari and some browsers that block automatic downloads.
            </Text>
            <Text fontSize="xs" color="gray.400" textAlign="center">
              If the image doesn't appear, try refreshing the page and generating again.
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" w="full" onClick={() => setFallbackImageUrl(null)}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </Box>
  );
}

export default App;