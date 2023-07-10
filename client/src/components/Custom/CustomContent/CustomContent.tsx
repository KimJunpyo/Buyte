import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ColorInput from './ColorInput';
import EraseButton from './EraseButton';
import RangeInput from './RangeInput';
import RangeInputContainer from './RangeInputContainer';
import UploadButton from './UploadButton';
import DragButton from './DragButton';
import DrawButton from './DrawButton';
import { CanvasWrapper, Canvas } from './CanvasComponent';

const ContentContainer = styled.div`
  margin-left: 20%;
  width: 80%;
  min-height: 100vh;
  background-color: rgba(255, 255, 255);
  backdrop-filter: blur(50px);
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const CustomContent: React.FC<{ selectedImageProp: string }> = ({ selectedImageProp }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>(5);
  const [color, setColor] = useState<string>('#000000');
  const [eraser, setEraser] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>(selectedImageProp);
  const [drawingActions, setDrawingActions] = useState<
    { x: number; y: number; color: string; size: number }[]
  >([]);

  const handleChangeSize = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(Number(event.target.value));
  };

  const handleChangeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  const handleUploadImage = (imageUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDragging(false); // Reset dragging state

    const image = new Image();
    image.src = imageUrl;

    image.onload = () => {
      const { naturalWidth, naturalHeight } = image;
      const targetWidth = 200;
      const targetHeight = 200;
      const aspectRatio = naturalWidth / naturalHeight;
      let width = targetWidth;
      let height = targetHeight;
      if (targetWidth / targetHeight > aspectRatio) {
        width = targetHeight * aspectRatio;
      } else {
        height = targetWidth / aspectRatio;
      }

      ctx.drawImage(image, 200, 200, width, height);

      setImages((prevImages) => [...prevImages, imageUrl]);
    };
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (drawingMode && isDragging) {
      const loadImagePromises = images.map((imageUrl, index) => {
        return new Promise<{ image: HTMLImageElement; xPos: number; yPos: number } | null>(
          (resolve) => {
            const image = new Image();
            image.src = imageUrl;

            image.onload = () => {
              const { naturalWidth, naturalHeight } = image;
              const targetWidth = 200;
              const targetHeight = 200;
              const aspectRatio = naturalWidth / naturalHeight;
              let width = targetWidth;
              let height = targetHeight;
              if (targetWidth / targetHeight > aspectRatio) {
                width = targetHeight * aspectRatio;
              } else {
                height = targetWidth / aspectRatio;
              }
              resolve({
                image,
                xPos: x - width / 2,
                yPos: y - height / 2 + index * 50,
              });
            };

            image.onerror = () => {
              resolve(null); // Return null on image loading failure
            };
          }
        );
      });

      Promise.all(loadImagePromises).then((loadedImages) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        loadedImages.forEach((loadedImage) => {
          if (loadedImage) {
            const { image, xPos, yPos } = loadedImage;

            const { naturalWidth, naturalHeight } = image;
            const targetWidth = 200;
            const targetHeight = 200;
            const aspectRatio = naturalWidth / naturalHeight;
            let width = targetWidth;
            let height = targetHeight;
            if (targetWidth / targetHeight > aspectRatio) {
              width = targetHeight * aspectRatio;
            } else {
              height = targetWidth / aspectRatio;
            }
            ctx.drawImage(image, xPos, yPos, width, height);
          }
        });
      });
    } else {
      if (event.buttons !== 1) return;

      ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
      ctx.lineWidth = size;
      ctx.strokeStyle = eraser ? 'rgba(0,0,0,1)' : color;
      ctx.lineTo(x, y);
      ctx.stroke();

      // Save the drawing action
      setDrawingActions((prevActions) => [
        ...prevActions,
        { x, y, color: eraser ? 'rgba(0,0,0,1)' : color, size },
      ]);
    }
  };
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (canvas && !drawingMode) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const target = eraser ? 'destination-out' : 'source-over';
        ctx.globalCompositeOperation = target;
        ctx.beginPath();
        ctx.moveTo(x, y);
        if (eraser) {
          const eraserWidth = ctx.lineWidth + 2;
          const temp = ctx.fillStyle;
          ctx.fillStyle = 'rgba(0,0,0,0)';
          ctx.fillRect(x - eraserWidth / 2, y - eraserWidth / 2, eraserWidth, eraserWidth);
          ctx.fillStyle = temp;
        }
      }

      setIsDragging(true);
    }
  };

  const handleEraseButtonClick = () => {
    setEraser(!eraser);
    setDrawingMode(false);
    setIsDragging(false);
  };

  const handleDrawButtonClick = () => {
    setEraser(false);
    setDrawingMode(true);
    setIsDragging(false);

    // Redraw all drawing actions except the ones erased by the eraser
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Iterate through drawingActions and redraw all actions
      drawingActions.forEach((action) => {
        if (action.color !== 'rgba(0,0,0,1)') {
          ctx.beginPath();
          ctx.moveTo(action.x, action.y);
          ctx.lineWidth = action.size;
          ctx.strokeStyle = action.color;
        } else {
          // Skip eraser actions
          return;
        }

        ctx.lineTo(action.x, action.y);
        ctx.stroke();
      });
    }
  };

  const handleToggleDrag = () => {
    setDrawingMode(true);
    setIsDragging((prev) => !prev);
    setEraser(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasWrapper = canvasWrapperRef.current;
    if (canvas && canvasWrapper) {
      canvas.width = canvasWrapper.clientWidth;
      canvas.height = canvasWrapper.clientHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      images.forEach((imageUrl) => {
        const image = new Image();
        image.src = imageUrl;
        image.onload = () => {
          const naturalWidth = image.naturalWidth;
          const naturalHeight = image.naturalHeight;
          const targetWidth = 200;
          const targetHeight = 200;
          const aspectRatio = naturalWidth / naturalHeight;
          let width = targetWidth;
          let height = targetHeight;
          if (targetWidth / targetHeight > aspectRatio) {
            width = targetHeight * aspectRatio;
          } else {
            height = targetWidth / aspectRatio;
          }
          ctx.drawImage(image, 200, 200, width, height);
        };
      });
      if (selectedImageProp !== '') {
        const image = new Image();
        image.src = selectedImageProp;
        image.onload = () => {
          const { naturalWidth, naturalHeight } = image;
          const targetWidth = 200;
          const targetHeight = 200;
          const aspectRatio = naturalWidth / naturalHeight;
          let width = targetWidth;
          let height = targetHeight;
          if (targetWidth / targetHeight > aspectRatio) {
            width = targetHeight * aspectRatio;
          } else {
            height = targetWidth / aspectRatio;
          }
          ctx.drawImage(image, 200, 200, width, height);
        };
      }
    }
  }, [images, selectedImageProp]);
  const handleDragStart = (event: React.DragEvent<HTMLImageElement>) => {
    if (selectedImageProp) {
      const imageUrl = event.currentTarget.src;
      event.dataTransfer.setData('text/plain', imageUrl);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const imageUrl = event.dataTransfer.getData('text/plain');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const { naturalWidth, naturalHeight } = image;
      const targetWidth = 200;
      const targetHeight = 200;
      const aspectRatio = naturalWidth / naturalHeight;
      let width = targetWidth;
      let height = targetHeight;
      if (targetWidth / targetHeight > aspectRatio) {
        width = targetHeight * aspectRatio;
      } else {
        height = targetWidth / aspectRatio;
      }
      ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
    };
  };

  return (
    <ContentContainer>
      <RangeInputContainer>
        <RangeInput id="line-width" value={size} onChange={handleChangeSize} />
        <ColorInput id="line-color" value={color} onChange={handleChangeColor} />
        <EraseButton eraser={eraser} onClick={handleEraseButtonClick} />
        <DragButton onToggleDrag={handleToggleDrag} />
        {!isLoading && <UploadButton id="upload-button" onUpload={handleUploadImage} />}
      </RangeInputContainer>
      <CanvasWrapper
        forwardedRef={canvasWrapperRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Canvas
          forwardedRef={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </CanvasWrapper>
    </ContentContainer>
  );
};

export default CustomContent;
