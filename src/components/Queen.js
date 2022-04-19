import { Image } from "react-konva";
import useImage from "use-image";

export default function Queen({ x,y , onDelete}) {
  const [image] = useImage(
    "https://deeplor.s3-us-west-2.amazonaws.com/picture_material_preview/2021/11/25/3034792.png"
  );

  return <Image x={x} y={y} width={100} height={100} image={image}  onClick={onDelete}/>;
}
