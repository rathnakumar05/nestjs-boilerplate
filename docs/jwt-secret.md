# JWT Secret Key Generation (Python)

This guide shows how to generate a **secure 256-bit JWT secret key** using Python.

## Why this is recommended

- Cryptographically secure randomness
- Suitable for HS256 / HS384 / HS512 JWT algorithms
- Safe for production use

## Python Code

```python
import secrets
import base64

key = secrets.token_bytes(32)  # 256-bit
print(base64.b64encode(key).decode())
```
