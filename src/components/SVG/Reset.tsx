type Props = {
  size: number;
};

export default function Reset(props: Props) {
  const { size } = props;

  return (
    <svg
      width={size ? `${size}px` : "512px"}
      height={size ? `${size}px` : "512px"}
      version="1.1"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M384,352l96-109.3h-66.1C407.1,141.8,325,64,223.2,64C117.8,64,32,150.1,32,256s85.8,192,191.2,192  c43.1,0,83.8-14.1,117.7-40.7l7.5-5.9l-43.2-46.2l-6.2,4.6c-22.1,16.3-48.3,24.9-75.8,24.9C152.6,384.7,95.1,327,95.1,256  c0-71,57.5-128.7,128.1-128.7c66.4,0,120.7,50,127.4,115.3h-74.1L384,352z"/>
    </svg>
  );
}
