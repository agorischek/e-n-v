import { descriptions, messages, patterns } from "../../shared/infrastructure";
import type { ZodSingleton } from "./types";

export const rabbitmqUrl = (z: ZodSingleton) =>
  z.string().describe(descriptions.rabbitmqUrl).regex(patterns.rabbitmqUrl, {
    message: messages.rabbitmqUrlFormat,
  });
