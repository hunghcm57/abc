
# get project
git clone https://github.com/hunghcm57/abc.git
git checkout feature/init_source

# run docker container
docker run -d --name mongodb -p 27017:27017 -v mongo_data:/data/db mongo:6.0
docker run -d --name ipfs-node -p 5001:5001 -p 8080:8080 -p 4001:4001 ipfs/go-ipfs:latest

# run backend
cd backend
npm install
npm run build
npm run start

# run frontend
cd frontend
npm install
npm run start

# access database 
docker exec -it mongodb mongosh
use metadata     // tên DB bạn dùng trong code (ví dụ: ipfs_cids)
db.files.find().pretty()

# access file in ipfs
http://localhost:8080/ipfs/QmX9rL7...xyz
