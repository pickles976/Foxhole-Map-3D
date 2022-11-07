# WARNING:

This project is a WIP, it's not super easy to set up yet or bug free.

# How to use:

0. run

```bash
pip install ./preprocessing/requirements.txt
npm install
```

1. Copy the files from [here](https://drive.google.com/drive/folders/1ExZoBcSPSC-mD5p6fPBCUR2JqJnnEMCo?usp=share_link) into the preprocessing/resources folder

2. run 
```bash
python heightmap_tiler.py
python texture_tiler.py
```

3. Copy the contents of preprocessing/quadmaps and preprocessing/texturemaps into resources

4. run

```bash
http-server .
```

You should now be able to access the full map at localhost:8080
