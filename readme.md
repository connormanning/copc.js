# COPC
![test](https://github.com/connormanning/copc/workflows/test/badge.svg)

A TypeScript library for reading and parsing [COPC](https://copc.io/) data.

`npm install copc`

## Usage

### Initialize a COPC object
```typescript
// Can also pass a getter instead of a filename string.
const copc = await Copc.create(filename)
console.log(copc)
```
```
{
  header: {
    fileSignature: 'LASF',
    fileSourceId: 0,
    globalEncoding: 16,
    projectId: '00000000-0000-0000-0000000000000000',
    majorVersion: 1,
    minorVersion: 4,
    systemIdentifier: '',
    generatingSoftware: '',
    fileCreationDayOfYear: 1,
    fileCreationYear: 1,
    headerLength: 375,
    pointDataOffset: 1424,
    vlrCount: 3,
    pointDataRecordFormat: 7,
    pointDataRecordLength: 36,
    pointCount: 100000,
    pointCountByReturn: [
      50002, 49998, 0, 0,
          0,     0, 0, 0,
          0,     0, 0, 0,
          0,     0, 0
    ],
    scale: [ 0.01, 0.01, 0.01 ],
    offset: [ -8242596, 4966606, 0 ],
    min: [ -8242746, 4966506, -50 ],
    max: [ -8242446, 4966706, 50 ],
    waveformDataOffset: 0,
    evlrOffset: 630520,
    evlrCount: 1
  },
  vlrs: [
    {
      userId: 'copc',
      recordId: 1,
      contentOffset: 429,
      contentLength: 160,
      description: 'COPC info VLR',
      isExtended: false
    },
    {
      userId: 'laszip encoded',
      recordId: 22204,
      contentOffset: 643,
      contentLength: 46,
      description: 'lazperf variant',
      isExtended: false
    },
    {
      userId: 'LASF_Projection',
      recordId: 2112,
      contentOffset: 743,
      contentLength: 681,
      description: '',
      isExtended: false
    },
    {
      userId: 'copc',
      recordId: 1000,
      contentOffset: 630580,
      contentLength: 160,
      description: 'COPC Hierarchy',
      isExtended: true
    }
  ],
  info: {
    cube: [ -8242746, 4966506, -50, -8242446, 4966806, 250 ],
    spacing: 2.34375,
    rootHierarchyPage: { pageOffset: 630580, pageLength: 160 },
    gpsTimeRange: [ 42, 42 ]
  },
  wkt: 'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs"],AUTHORITY["EPSG","3857"]]',
  eb: []
}
```

### Traverse hierarchy and read point data
```typescript
const { nodes, pages } = await Copc.loadHierarchyPage(
  filename,
  copc.info.rootHierarchyPage
)
const root = nodes['0-0-0-0']!
const view = await Copc.loadPointDataView(filename, copc, root)
console.log('Dimensions:', view.dimensions)

const getters = ['X', 'Y', 'Z', 'Intensity'].map(view.getter)
function getXyzi(index: number) {
  return getters.map(get => get(index))
}
const point = getXyzi(0)
console.log('Point:', point)
```
```
Dimensions: {
  X: { type: 'float', size: 8 },
  Y: { type: 'float', size: 8 },
  Z: { type: 'float', size: 8 },
  Intensity: { type: 'unsigned', size: 2 },
  ReturnNumber: { type: 'unsigned', size: 1 },
  NumberOfReturns: { type: 'unsigned', size: 1 },
  Synthetic: { type: 'unsigned', size: 1 },
  KeyPoint: { type: 'unsigned', size: 1 },
  Withheld: { type: 'unsigned', size: 1 },
  Overlap: { type: 'unsigned', size: 1 },
  ScannerChannel: { type: 'unsigned', size: 1 },
  ScanDirectionFlag: { type: 'unsigned', size: 1 },
  EdgeOfFlightLine: { type: 'unsigned', size: 1 },
  Classification: { type: 'unsigned', size: 1 },
  UserData: { type: 'unsigned', size: 1 },
  ScanAngle: { type: 'float', size: 4 },
  PointSourceId: { type: 'unsigned', size: 2 },
  GpsTime: { type: 'float', size: 8 },
  Red: { type: 'unsigned', size: 2 },
  Green: { type: 'unsigned', size: 2 },
  Blue: { type: 'unsigned', size: 2 }
}
Point: [-8242596, 4966706, 50, 128]
```
