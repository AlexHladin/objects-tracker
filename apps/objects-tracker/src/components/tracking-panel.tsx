import { ListItem, ListItemText, Typography } from '@mui/material';
import { MapObject } from '@objects-tracker/types';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

export interface TrackingPanelProps {
  height: number;
  itemData: MapObject[];
}

function renderRow(props: ListChildComponentProps) {
  const { index, style, data } = props;
  const renderedObject: MapObject = data[index];

  return (
    <ListItem key={renderedObject.id} style={style}>
      <ListItemText
        primary={`ID: ${renderedObject.id}`}
        secondary={`Lat: ${renderedObject.position.lat.toFixed(
          4
        )}, Lng: ${renderedObject.position.lng.toFixed(
          4
        )}, DirX: ${renderedObject.direction.x.toFixed(
          2
        )}, DirY: ${renderedObject.direction.y.toFixed(2)}`}
      />
    </ListItem>
  );
}

const TrackingPanel = ({ height, itemData }: TrackingPanelProps) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Tracking Panel (objects count: {itemData.length})
      </Typography>

      <FixedSizeList
        width="100%"
        height={height}
        itemData={itemData}
        itemCount={itemData.length}
        itemSize={64}
      >
        {renderRow}
      </FixedSizeList>
    </>
  );
};

export default TrackingPanel;
