## PT HMS API Documentation

### API URL : https://api-pt-hms.vercel.app

### User Register

Endpoint : `POST /api/register`

Request Type : `multipart/form-data`

Request Body :

| Field         | Type   | Required | Description                       |
| ------------- | ------ | -------- | --------------------------------- |
| `foto_profil` | File   | ✅       | Foto profil pengguna              |
| `nama`        | String | ✅       | Nama lengkap pengguna             |
| `no_pol`      | String | ✅       | Nomor polisi kendaraan            |
| `kategori`    | String | ✅       | Kategori kendaraan                |
| `mobil`       | String | ✅       | Nama atau tipe mobil              |
| `no_kep`      | String | ✅       | Nomor keanggotaan/kepegawaian     |
| `exp_kep`     | Date   | ✅       | Tanggal kedaluwarsa keanggotaan   |
| `no_hp`       | String | ✅       | Nomor HP pengguna                 |
| `no_darurat`  | String | ✅       | Nomor darurat yang bisa dihubungi |
| `password`    | String | ✅       | Kata sandi pengguna               |

Contoh Request (Form Data) :

| Key         | Value       |
| ----------- | ----------- |
| foto_profil | (file)      |
| nama        | John Doe    |
| no_pol      | B1234XYZ    |
| kategori    | pribadi     |
| mobil       | Avanza      |
| no_kep      | KEP12345    |
| exp_kep     | 2026-12-31  |
| no_hp       | 08123456789 |
| no_darurat  | 08198765432 |
| password    | secret123   |

Response Success (201) :

```json
{
   "message": "Register berhasil",
   "driver": {
      "id": 1,
      "foto_profil": "http://127.0.0.1:9000/uploads/driver123.jpg",
      "nama": "John Doe",
      "no_pol": "B1234XYZ",
      "kategori": "pribadi",
      "mobil": "Avanza",
      "no_kep": "KEP12345",
      "exp_kep": "2026-12-31T00:00:00.000Z",
      "no_hp": "08123456789",
      "no_darurat": "08198765432",
      "role": "driver"
   }
}
```

Response Error (400) :

```json
{
   "message": "Semua field harus diisi"
}
```

```json
{
   "message": "Plat Nomor sudah terdaftar"
}
```

Response Error (500) :

```json
{
   "message": "Internal server error"
}
```

### User Login

Endpoint : `POST /api/login`

Request Type : `application/json`

Request Body :

| Field      | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| `no_pol`   | String | ✅       | Nomor polisi kendaraan |
| `password` | String | ✅       | Kata sandi pengguna    |

Contoh Request :

```json
{
   "no_pol": "B 1234 ALD",
   "password": "qwertyuiop"
}
```

Response Success (200) :

```json
{
   "message": "Login berhasil",
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   "driver": {
      "id": 1,
      "nama": "John Doe",
      "no_pol": "B1234XYZ",
      "kategori": "pribadi",
      "mobil": "Avanza",
      "no_hp": "08123456789",
      "role": "driver"
   }
}
```

Response Error (400) :

```json
{
   "message": "Semua field harus diisi"
}
```

```json
{
   "message": "Plat nomor tidak terdaftar"
}
```

```json
{
   "message": "Password salah"
}
```

Response Error (500) :

```json
{
   "message": "Internal server error"
}
```
