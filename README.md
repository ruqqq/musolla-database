﷽

# Musolla Database
Flat file + JSON database to make musolla data (info/details, location and images) readily available/accessible on GitHub and most importantly, open-source.

The initial set of data was collected by KalamApps team who was then absorbed by PrayerTime.SG/Fivecalling team - the last curator of this musolla data.

IMPORTANT: Refer to [LICENSE](https://raw.githubusercontent.com/ruqqq/musolla-database/master/LICENSE) for terms of use.

# Changelogs
**19/4/2016**
Initial framework/tools/data commit using data from PrayerTime.sg/Fivecalling/KalamApps.

# Motive/Why/About
Democratization (read: open-source) of musolla data. Data is collected by community for the community.

With GitHub as a platform to house open-source data of musolla details and locations around the world, the data will always available to be served to a (web/mobile/desktop) app via a http link for free. We will also be able to utilize Pull Requests, GitHub Issues, Diff, Versioning, Blaming etc. to maintain/manage the data. There are few drawbacks to this method of serving data but I believe this is the best way to ensure that the data will always be free.

I hope that the database will grow large with contributions from EVERYONE. InsyaAllah with this, we will be able to help one another find a place to perform their daily prayers amidst today's hectic and difficult world.

# How to Use
Minimally, the data set can be used by directly linking  [data.json](https://raw.githubusercontent.com/ruqqq/musolla-database/master/data.json) file in your web/app and do local parsing.

Otherwise, you can download the data onto your (web/mobile/desktop) app and do client-side processing and storing. (Hint: You are free to create syncing tool if you decide to keep a version of the data locally). Please refer to LICENSE for more info on restrictions on the usage of the data.

## Querying By Location (Geohash)
The musolla database supports querying by location, ideally finding a musolla within 1km. It is not super accurate as we are using geohashing to achieve this. However, it does serve our purpose well since we do not need accuracy within metres.

You can refer to `tools/test_geohash.js` for a sample implementation although the script deals with local files as opposed to file served over http. (TODO: Provide example codes for querying over http)

**Example Querying for Location 1.434466, 103.785648**

1. Find bounding coordinates given a lat, lng and distance to bound. In our case, for our coordinates with distance 1km: `(1.425472798056653, 103.77665197881018)` and `(1.443459201943347, 103.79464402118982)`
2. Get the geohashes of the given bounding box. (It should be a list of hashes)
3. Download the musolla data for the geohashes. Example link to a geohash:
[https://raw.githubusercontent.com/ruqqq/musolla-database/master/geohashed/w23b1t.json](https://raw.githubusercontent.com/ruqqq/musolla-database/master/geohashed/w23b1t.json)
4. If you get a `404 (File not found)` means there are no data for the particular geohash. Otherwise concatenate all the data from the geohashes which returned `200` to build a list of result.

# How to Contribute
## 2 Methods:
### Method 1: Create GitHub Issue (Layman Method)
Create a [GitHub issue](https://github.com/ruqqq/musolla-database/issues) with the relevant details of the musolla. Refer to data format section below for list of columns/fields needed.

### Method 2: Pull Request (Advanced Method)
Send pull requests to add new musolla and/or images. No programming needed, just basic text editing, file management and minimal Git skills. (TODO: Add manual for non-geeks)

## Updating geohashed Database (optional)
`tools/generate_geohashes.js` can be used to regenerate the geohashed files based on `data.json`. If you are sending a pull request, it'll be nice if you could run the regeneration so the pull request can be merged immediately. This step is optional however as if the geohashed files are not updated on new musolla entry, I will regenerate it after merging the pull request.

## Data Format
(TODO: Elaborate repository structure, JSON schema)

### Example JSON Structure for a Musolla Entry
```JSON
{
  "uuid": "f8ccc11e-65aa-4fcf-b2b1-614d276b6630",
  "name": "Northpoint",
  "address": "Yishun Avenue 2 S(769098)",
  "location": {
    "latitude": 1.429836,
    "longitude": 103.835568
  },
  "type": "Musolla",
  "geohash": "w23b4u6c2h",
  "mrt": "Yishun",
  "directions": "Head to the lift lobby on level 4, nect to Kid@Play waterpark. The lift lobby is right beside the washroom. Enter the staircase landing in front of the cargo lifts. Musolla is on the top floor.",
  "level": "4",
  "toiletLevel": "4",
  "unisexCapacity": 2,
  "maleCapacity": 0,
  "femaleCapacity": 0,
  "remarks": "Not an official praying area. Shared male & female area. Provision found in the hosereel cabinet.",
  "images": [
    {
      "uuid": "28f2650f-a6ed-46ba-90e7-a60196ae12b1",
      "uploaderName": "Tengku Hafidz",
      "createdAt": "2015-06-04T06:34:11.389Z",
      "updatedAt": "2015-06-04T06:34:11.389Z"
    }
  ],
  "createdAt": "2014-12-23T04:46:36.979Z",
  "updatedAt": "2014-12-23T05:32:49.084Z"
}
```

# TODOs
- Web based tool to help non-geeks craft JSON entry for Musolla
- Web based tool to find Musolla given a location via Geohashing
- {PUT YOUR CREATIVE IDEA HERE}
