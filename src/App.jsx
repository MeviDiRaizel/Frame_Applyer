import React, { useState, useRef, useEffect } from 'react';
import { Box, VStack, Image, Text, Button, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, useColorMode, IconButton, Container, useToast,  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Link, } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
const getAssetPath = (path) => {
  const base = import.meta.env.BASE_URL || '/Frame_Applyer/';
  return `${base}${path}`;
};

function App() {
  
  const DEFAULT_FRAME = {
    enabled: true,
    url: getAssetPath("frames/MiniOL.png"),
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
    
    // Trigger confetti on every click
    triggerConfetti();
    
    if (newClickCount === 1) {
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
    } else if (newClickCount === 5) {
      const url = "https://www.youtube.com/watch?v=xvFZjo5PgG0";
      if (isMobile()) {
        // Mobile: Try to open YouTube app
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          // iOS: Use youtube:// scheme
          window.location.href = `youtube://${url.split('watch?v=')[1]}`;
        } else {
          // Android: Use vnd.youtube scheme
          window.location.href = `vnd.youtube:${url.split('watch?v=')[1]}`;
        }
        // Fallback to browser if YouTube app isn't installed (after a short delay)
        setTimeout(() => {
          window.location.href = url;
        }, 500);
      } else {
        // Desktop: Open in new tab
        window.open(url, '_blank');
      }
    }
  
    // Reset counter after 3 seconds of inactivity
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

  const downloadImage = async () => {
    if (compositeRef.current) {
      const currentPosition = { ...position };
    
    const dataUrl = await toPng(compositeRef.current, {
      quality: 1.0,
      pixelRatio: 1,
      width: 1500,
      height: 1500,
      style: {
        transform: 'scale(3.33)',
        transformOrigin: 'top left'
      },
      filter: (node) => {
        if (node instanceof HTMLImageElement && node.alt === "Profile") {
          node.style.transform = `translate(${currentPosition.x * 3.33}px, ${currentPosition.y * 3.33}px) scale(${scale}) rotate(${rotation}deg)`;
        }
        return true;
      }
    });
  
       // Create blob and trigger download
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = 'profile-frame.png';
      link.href = blobUrl;
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(blobUrl);
      
      // Show success toast
      toast({
        title: "Download started!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
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
                style={{ aspectRatio: '1/1',
                  touchAction: 'none', // Prevents scrolling while dragging
                  WebkitUserSelect: 'none',
                  userSelect: 'none' }}
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
                  </HStack>
                </VStack>
              )}
            </>
          )}
        <Text 
          fontSize="sm" 
          color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
          textAlign="center"
          pb={4}
        >
          Made with ❤️ by Jed
        </Text>
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
      
    </Box>
  );
}

export default App;